import nodemailer from 'nodemailer';
import { Order, OfflineBooking, EmailNotificationSettings, EmailLog } from '../src/types';
import { db } from './db';

// Helper to create a nodemailer transporter safely
export function getTransporter(settings: EmailNotificationSettings) {
  const host = settings.smtpHost || process.env.SMTP_HOST;
  const port = settings.smtpPort || Number(process.env.SMTP_PORT) || 465;
  const user = settings.smtpUser || process.env.SMTP_USER || process.env.GMAIL_USER || 'flora7loveunfolded@gmail.com';
  const pass = settings.smtpPass || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (user && pass) {
    const isGmail = host === 'smtp.gmail.com' || user.toLowerCase().includes('@gmail.com');
    if (isGmail) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass }
      });
    }

    return nodemailer.createTransport({
      host: host || 'smtp.gmail.com',
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  }

  return null;
}

// Helper to extract full product specifications and high-detail description for emails
function getItemFullDetails(item: any, appUrl: string) {
  const products = db.getProducts();
  const catalogProduct = products.find(p => 
    p.id === item.productId || 
    p.slug === item.productId || 
    p.name.toLowerCase() === item.title.toLowerCase()
  );

  const custom = (item.customisationDetails || {}) as any;

  const flowerCount = custom.numberOfFlowers || catalogProduct?.numberOfFlowers || 1;
  const flowerType = custom.flowerType || catalogProduct?.flowerType || 'Handmade Satin Ribbon Rose';
  const colors = custom.colour || (Array.isArray(custom.flowerColours) ? custom.flowerColours.join(', ') : custom.flowerColours) || (catalogProduct?.availableColours ? catalogProduct.availableColours.join(', ') : 'Signature Rose Hue');
  const wrapping = custom.wrapping || custom.wrappingColour || (catalogProduct?.wrappingOptions && catalogProduct.wrappingOptions[0]) || 'Premium Waterproof Korean Matte Floral Paper';
  const ribbon = custom.ribbon || custom.ribbonColour || (catalogProduct?.ribbonColours && catalogProduct.ribbonColours[0]) || 'Lustrous Satin Ribbon Bow';
  const hasPearls = Boolean(custom.hasPearls || custom.pearl || custom.centrePearl || catalogProduct?.hasPearlOption);
  const hasFairyLights = Boolean(custom.hasFairyLights);
  const cardMessage = custom.cardMessage || custom.messageCardText || custom.messageCard || '';
  const giftTag = custom.giftTag || custom.giftTagName || '';
  const size = custom.size || custom.bouquetSize || 'Standard Hand-tied Arrangement';

  let detailedDescription = catalogProduct?.description || catalogProduct?.shortDescription || '';
  if (!detailedDescription) {
    if (item.isCustomBouquet) {
      detailedDescription = `Custom bespoke handcrafted satin ribbon bouquet personalized with ${flowerCount} everlasting ${flowerType.toLowerCase()}(s). Meticulously folded petal-by-petal using premium double-faced satin ribbon that never wilts.`;
    } else {
      detailedDescription = `Everlasting handcrafted satin ribbon flower arrangement. Each petal is individually cut, shaped, and flame-sealed by hand for an exquisite, lifelong romantic keepsake.`;
    }
  }

  const imageUrl = item.image
    ? (item.image.startsWith('http') ? item.image : `${appUrl}${item.image}`)
    : (catalogProduct?.images?.[0] ? (catalogProduct.images[0].startsWith('http') ? catalogProduct.images[0] : `${appUrl}${catalogProduct.images[0]}`) : '');

  return {
    catalogProduct,
    flowerCount,
    flowerType,
    colors,
    wrapping,
    ribbon,
    hasPearls,
    hasFairyLights,
    cardMessage,
    giftTag,
    size,
    detailedDescription,
    imageUrl
  };
}

// Generate styled HTML template for Owner Order Notification
export function generateOwnerOrderEmailHtml(order: Order, appUrl: string = 'https://flora7.com'): string {
  const formattedDate = new Date(order.createdAt || Date.now()).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'short'
  });

  const phoneDigits = (order.customerPhone || '').replace(/[^0-9]/g, '');

  const itemsHtml = order.items.map(item => {
    const details = getItemFullDetails(item, appUrl);

    return `
    <div style="background: #ffffff; border: 1.5px solid #fce7f0; border-radius: 14px; padding: 16px; margin-bottom: 16px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          ${details.imageUrl ? `
          <td style="width: 70px; vertical-align: top; padding-right: 14px;">
            <img src="${details.imageUrl}" alt="${item.title}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 10px; border: 1px solid #f4b8c7;" />
          </td>` : ''}
          <td style="vertical-align: top;">
            <div style="font-weight: 800; color: #5c2533; font-size: 15px; font-family: Georgia, serif;">${item.title}</div>
            <div style="font-size: 12px; color: #8c5263; margin-top: 3px; font-weight: 600;">
              Quantity: <strong>${item.quantity}</strong> × ₹${item.price} &nbsp;•&nbsp; <span style="color: #b76e79;">Item Total: ₹${item.price * item.quantity}</span>
            </div>
            <div style="background: #fff9fa; padding: 8px 12px; border-radius: 8px; margin-top: 8px; font-size: 11.5px; color: #5e5254; border-left: 3px solid #b76e79; line-height: 1.5;">
              <strong>Product Description:</strong> ${details.detailedDescription}
            </div>
          </td>
        </tr>
      </table>

      <!-- Specifications for Owner Assembly -->
      <div style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed #fce7f0; font-size: 12px; color: #3d1822;">
        <div style="font-size: 11px; font-weight: 800; color: #b76e79; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
          ✂️ Assembly & Crafting Specifications:
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <tr>
            <td style="padding: 2px 0; color: #7a4654; width: 40%;"><strong>Flowers:</strong></td>
            <td style="padding: 2px 0; color: #3d1822;">${details.flowerCount} × ${details.flowerType}</td>
          </tr>
          <tr>
            <td style="padding: 2px 0; color: #7a4654;"><strong>Color(s):</strong></td>
            <td style="padding: 2px 0; color: #3d1822; font-weight: 600;">${details.colors}</td>
          </tr>
          <tr>
            <td style="padding: 2px 0; color: #7a4654;"><strong>Wrapping Paper:</strong></td>
            <td style="padding: 2px 0; color: #3d1822;">${details.wrapping}</td>
          </tr>
          <tr>
            <td style="padding: 2px 0; color: #7a4654;"><strong>Ribbon Bow:</strong></td>
            <td style="padding: 2px 0; color: #3d1822;">${details.ribbon}</td>
          </tr>
          ${details.hasPearls ? `
          <tr>
            <td style="padding: 2px 0; color: #7a4654;"><strong>Center Pearls:</strong></td>
            <td style="padding: 2px 0; color: #b76e79; font-weight: 600;">✨ Add pearls to bloom centers</td>
          </tr>` : ''}
          ${details.hasFairyLights ? `
          <tr>
            <td style="padding: 2px 0; color: #7a4654;"><strong>Fairy Lights:</strong></td>
            <td style="padding: 2px 0; color: #16a34a; font-weight: 700;">💡 Include warm LED fairy lights</td>
          </tr>` : ''}
          ${details.cardMessage ? `
          <tr>
            <td style="padding: 2px 0; color: #7a4654; vertical-align: top;"><strong>Card Message:</strong></td>
            <td style="padding: 2px 0; color: #5c2533; font-style: italic; font-weight: 600;">"${details.cardMessage}"</td>
          </tr>` : ''}
          ${details.giftTag ? `
          <tr>
            <td style="padding: 2px 0; color: #7a4654;"><strong>Gift Tag:</strong></td>
            <td style="padding: 2px 0; color: #3d1822;">"${details.giftTag}"</td>
          </tr>` : ''}
        </table>
      </div>
    </div>
    `;
  }).join('');

  const isPaid = order.paymentStatus === 'PAID';
  const paymentBadgeColor = isPaid ? '#15803d' : order.paymentStatus === 'PARTIAL' ? '#b45309' : '#b91c1c';
  const paymentBadgeBg = isPaid ? '#f0fdf4' : order.paymentStatus === 'PARTIAL' ? '#fffbeb' : '#fef2f2';
  const paymentBadgeBorder = isPaid ? '#bbf7d0' : order.paymentStatus === 'PARTIAL' ? '#fde68a' : '#fecaca';

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Order Details - ${order.orderNumber}</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fdf6f7; margin: 0; padding: 24px 12px;">
    <div style="max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(183, 110, 121, 0.12); border: 1px solid #fce7f0;">
      
      <!-- Header Banner -->
      <div style="background: linear-gradient(135deg, #5c2533 0%, #8c3b52 100%); padding: 28px 24px; text-align: center; color: #ffffff;">
        <div style="font-size: 24px; font-weight: 800; letter-spacing: 2px;">FLORA7</div>
        <div style="font-size: 12px; letter-spacing: 3px; color: #f4b8c7; margin-top: 4px; text-transform: uppercase;">Handmade Satin Ribbon Flowers</div>
        <div style="margin-top: 14px; display: inline-block; background: #ffffff; color: #5c2533; font-size: 13px; font-weight: 800; padding: 6px 16px; border-radius: 30px; box-shadow: 0 2px 6px rgba(0,0,0,0.15);">
          ${order.orderStatus === 'DELIVERED' ? `✅ ORDER DELIVERED & COMPLETED: ${order.orderNumber}` : `🚨 ORDER DETAILS & NOTIFICATION: ${order.orderNumber}`}
        </div>
        <div style="margin-top: 8px; font-size: 11.5px; color: #ffd6e0; letter-spacing: 0.5px;">
          📬 Owner Notification sent to: <strong>flora7loveunfolded@gmail.com</strong>
        </div>
      </div>

      <!-- Main Body -->
      <div style="padding: 24px;">
        <div style="font-size: 16px; color: #3d1822; line-height: 1.5; margin-bottom: 20px;">
          ${order.orderStatus === 'DELIVERED'
            ? `Hello <strong>Shwetha</strong>, here are the complete order specifications and fulfillment records for <strong>Delivered Order ${order.orderNumber}</strong>:`
            : `Hello <strong>Shwetha</strong>, here are the complete order specifications and customer details for <strong>${order.orderNumber}</strong>:`
          }
        </div>

        ${order.orderStatus === 'DELIVERED' ? `
        <!-- Delivered Confirmation Card -->
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 14px 16px; margin-bottom: 20px; font-size: 13px; color: #166534; line-height: 1.5;">
          <strong style="font-size: 14px;">✅ Product Delivery Confirmed:</strong><br />
          This order has been fulfilled and delivered to customer <strong>${order.customerName}</strong>. All customer contacts, bouquet craft specifications, address details, and financial records remain permanently recorded for your studio records.
        </div>
        ` : ''}

        <!-- Order Summary Card -->
        <div style="background: #fff9fa; border: 1px solid #fce7f0; border-radius: 14px; padding: 18px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #8c5263; width: 42%;">Order Number:</td>
              <td style="padding: 6px 0; font-weight: 800; color: #5c2533; text-align: right;">${order.orderNumber}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #8c5263;">Order Placed:</td>
              <td style="padding: 6px 0; font-weight: 600; color: #3d1822; text-align: right;">${formattedDate} IST</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #8c5263;">Current Status:</td>
              <td style="padding: 6px 0; font-weight: 800; color: #b76e79; text-align: right;">
                <span style="background: #fdf2f4; border: 1px solid #f4b8c7; color: #5c2533; padding: 2px 10px; border-radius: 12px; font-size: 11px; text-transform: uppercase;">
                  ${order.orderStatus}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #8c5263;">Customer Name:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #3d1822; text-align: right;">${order.customerName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #8c5263;">Customer Phone:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #3d1822; text-align: right;">
                <a href="tel:${order.customerPhone}" style="color: #b76e79; text-decoration: none;">${order.customerPhone}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #8c5263;">Customer Email:</td>
              <td style="padding: 6px 0; font-weight: 600; color: #3d1822; text-align: right;">
                ${order.customerEmail ? `<a href="mailto:${order.customerEmail}" style="color: #b76e79; text-decoration: none;">${order.customerEmail}</a>` : '<span style="color: #999;">Not provided</span>'}
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #8c5263;">Fulfillment Type:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #5c2533; text-align: right;">${order.isPickup ? '🛍️ Studio Self-Pickup' : '🚚 Home Delivery'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #8c5263;">Target Date & Slot:</td>
              <td style="padding: 6px 0; font-weight: 700; color: #3d1822; text-align: right;">${order.deliveryDate} (${order.preferredSlot || 'Standard'})</td>
            </tr>
            ${order.isPickup ? `
            <tr>
              <td style="padding: 6px 0; color: #8c5263; vertical-align: top;">Pickup Studio:</td>
              <td style="padding: 6px 0; font-weight: 600; color: #3d1822; text-align: right;">Flora7 Studio, Koramangala 4th Block, Bangalore - 560034</td>
            </tr>
            ` : (order.shippingAddress ? `
            <tr>
              <td style="padding: 6px 0; color: #8c5263; vertical-align: top;">Delivery Address:</td>
              <td style="padding: 6px 0; font-weight: 600; color: #3d1822; text-align: right;">
                ${order.shippingAddress}
                ${order.landmark ? `<br /><span style="font-size: 11px; color: #7a4654;">Landmark: ${order.landmark}</span>` : ''}
                ${order.pincode ? ` (${order.pincode})` : ''}
              </td>
            </tr>
            ` : '')}
            <tr>
              <td style="padding: 6px 0; color: #8c5263;">Payment:</td>
              <td style="padding: 6px 0; text-align: right;">
                <span style="display: inline-block; background: ${paymentBadgeBg}; border: 1px solid ${paymentBadgeBorder}; color: ${paymentBadgeColor}; padding: 3px 10px; border-radius: 12px; font-weight: 800; font-size: 12px;">
                  ${order.paymentMethod} • ${order.paymentStatus}
                </span>
              </td>
            </tr>
          </table>
        </div>

        <!-- Special Notes / Gift Message -->
        ${order.giftMessage || order.specialInstructions ? `
        <div style="background: #fdf2f4; border: 1px dashed #b76e79; border-radius: 12px; padding: 14px; margin-bottom: 24px; font-size: 13px;">
          ${order.giftMessage ? `<div>💌 <strong>Gift Message to Include:</strong> <em>"${order.giftMessage}"</em></div>` : ''}
          ${order.specialInstructions ? `<div style="margin-top: 6px;">📝 <strong>Special Instructions from Customer:</strong> ${order.specialInstructions}</div>` : ''}
        </div>
        ` : ''}

        <!-- Items with Detailed Product Descriptions -->
        <div style="margin-bottom: 24px;">
          <div style="font-weight: 800; color: #5c2533; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; border-bottom: 2px solid #fce7f0; padding-bottom: 6px;">
            Ordered Items & Detailed Descriptions (${order.items.length})
          </div>
          ${itemsHtml}
        </div>

        <!-- Financial Totals -->
        <div style="background: #faf5f6; border-radius: 12px; padding: 16px; margin-bottom: 28px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 4px 0; color: #7a4654;">Subtotal:</td>
              <td style="padding: 4px 0; font-weight: 600; text-align: right; color: #3d1822;">₹${order.subtotal}</td>
            </tr>
            ${order.discountAmount ? `
            <tr>
              <td style="padding: 4px 0; color: #166534;">Coupon Discount (${order.couponCode || ''}):</td>
              <td style="padding: 4px 0; font-weight: 600; text-align: right; color: #166534;">-₹${order.discountAmount}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 4px 0; color: #7a4654;">Delivery Fee:</td>
              <td style="padding: 4px 0; font-weight: 600; text-align: right; color: #3d1822;">${order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</td>
            </tr>
            <tr style="border-top: 1.5px solid #f4b8c7;">
              <td style="padding: 10px 0 4px 0; font-weight: 800; font-size: 16px; color: #5c2533;">Total Order Amount:</td>
              <td style="padding: 10px 0 4px 0; font-weight: 800; font-size: 18px; text-align: right; color: #b76e79;">₹${order.totalAmount}</td>
            </tr>
          </table>
        </div>

        <!-- Quick Action Buttons for Owner -->
        <div style="text-align: center; margin-bottom: 16px;">
          <a href="${appUrl}/admin/dashboard" style="display: inline-block; background: #5c2533; color: #ffffff; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 30px; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(92, 37, 51, 0.25);">
            Open Owner Portal to Manage Order →
          </a>
        </div>
        <div style="text-align: center; display: flex; justify-content: center; gap: 16px; margin-top: 10px;">
          <a href="https://wa.me/${phoneDigits}?text=Hi%20${encodeURIComponent(order.customerName || 'Customer')},%20thank%20you%20for%20your%20order%20${order.orderNumber}%20at%20Flora7!%20Shwetha%20here%20from%20Flora7." style="font-size: 13px; color: #16a34a; font-weight: 700; text-decoration: none; padding: 6px 12px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 20px; display: inline-block;">
            💬 WhatsApp Customer Directly
          </a>
          <a href="tel:${order.customerPhone}" style="font-size: 13px; color: #5c2533; font-weight: 700; text-decoration: none; padding: 6px 12px; background: #fdf2f4; border: 1px solid #f4b8c7; border-radius: 20px; display: inline-block;">
            📞 Call Customer
          </a>
        </div>

      </div>

      <!-- Footer -->
      <div style="background: #fff9fa; border-top: 1px solid #fce7f0; padding: 16px; text-align: center; font-size: 11px; color: #8c5263;">
        Flora7 Handmade Studio • Bangalore, India • Crafted with Love by Shwetha<br />
        This is an automated notification from your Flora7 online store sent to <strong>flora7loveunfolded@gmail.com</strong>.
      </div>
    </div>
  </body>
  </html>
  `;
}

// Generate comprehensive plain-text email with all order details
export function generateOwnerOrderEmailText(order: Order, appUrl: string = 'https://flora7.com'): string {
  const formattedDate = new Date(order.createdAt || Date.now()).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'short'
  });

  const phoneDigits = (order.customerPhone || '').replace(/[^0-9]/g, '');

  const itemsText = order.items.map((item, idx) => {
    const details = getItemFullDetails(item, appUrl);
    const specs = [
      `   • Flower Specs: ${details.flowerCount}x ${details.flowerType}`,
      `   • Flower Color(s): ${details.colors}`,
      `   • Wrapping Paper: ${details.wrapping}`,
      `   • Ribbon Bow: ${details.ribbon}`,
      details.hasPearls ? `   • Center Pearls: Included (bloom centers)` : null,
      details.hasFairyLights ? `   • Fairy Lights: Included (warm LEDs)` : null,
      details.cardMessage ? `   • Bouquet Card Message: "${details.cardMessage}"` : null,
      details.giftTag ? `   • Gift Tag: "${details.giftTag}"` : null,
    ].filter(Boolean).join('\n');

    return `${idx + 1}. ${item.title} (Qty: ${item.quantity} × ₹${item.price} = ₹${item.price * item.quantity})
   Description: ${details.detailedDescription}
${specs}`;
  }).join('\n\n');

  const isDelivered = order.orderStatus === 'DELIVERED';

  return `===============================================================
🌸 FLORA7 HANDMADE FLOWER STUDIO - ${isDelivered ? 'ORDER DELIVERED & COMPLETED SUMMARY' : 'CUSTOMER ORDER DETAILS'}
===============================================================

Notification sent to: flora7loveunfolded@gmail.com
Order ID: ${order.orderNumber}
Placed On: ${formattedDate} IST
Order Status: ${order.orderStatus} ${isDelivered ? '(PRODUCT DELIVERED TO CUSTOMER)' : ''}

1. CUSTOMER INFORMATION
---------------------------------------------------------------
Name: ${order.customerName}
Phone: ${order.customerPhone}
Email: ${order.customerEmail || 'Not provided'}
WhatsApp: https://wa.me/${phoneDigits}?text=Hi%20${encodeURIComponent(order.customerName || 'Customer')},%20thank%20you%20for%20your%20order%20${order.orderNumber}%20at%20Flora7!

2. DELIVERY / FULFILLMENT SPECIFICATIONS
---------------------------------------------------------------
Fulfillment Type: ${order.isPickup ? '🛍️ Studio Self-Pickup' : '🚚 Home Delivery'}
Target Date: ${order.deliveryDate}
Preferred Time Slot: ${order.preferredSlot || 'Standard Delivery'}
${order.isPickup
  ? `Pickup Address: Flora7 Handmade Flower Studio, Koramangala 4th Block, Bangalore - 560034 (Customer collecting in person)`
  : `Delivery Address: ${order.shippingAddress || 'N/A'}
Landmark: ${order.landmark || 'N/A'}
Pincode: ${order.pincode || 'N/A'}`
}
${isDelivered ? `Delivery Status: ✅ Product successfully delivered to customer\n` : ''}

3. PAYMENT & FINANCIAL STATUS
---------------------------------------------------------------
Payment Method: ${order.paymentMethod}
Payment Status: ${order.paymentStatus}
Items Subtotal: ₹${order.subtotal}
${order.discountAmount ? `Coupon Discount (${order.couponCode || 'PROMO'}): -₹${order.discountAmount}\n` : ''}Delivery Charge: ${order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}
---------------------------------------------------------------
TOTAL ORDER AMOUNT: ₹${order.totalAmount}
---------------------------------------------------------------

4. GIFT CARD MESSAGE & CUSTOMER INSTRUCTIONS
---------------------------------------------------------------
Gift Message: ${order.giftMessage ? `"${order.giftMessage}"` : 'None specified'}
Special Delivery Instructions: ${order.specialInstructions || 'None'}

5. ITEM & HANDCRAFT SPECIFICATIONS (${order.items.length} Item${order.items.length > 1 ? 's' : ''})
---------------------------------------------------------------
${itemsText}

===============================================================
MANAGE ORDER IN OWNER PORTAL:
${appUrl}/admin/dashboard

Flora7 Handmade Studio • Bangalore, India
Crafted with love by Shwetha
===============================================================`;
}

// Generate Customer Order Confirmation Email with Complete Product Descriptions
export function generateCustomerOrderEmailHtml(order: Order, appUrl: string = 'https://flora7.com'): string {
  const itemsCards = order.items.map(item => {
    const details = getItemFullDetails(item, appUrl);

    return `
    <div style="background: #ffffff; border: 1.5px solid #fce7f0; border-radius: 14px; padding: 16px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(183, 110, 121, 0.05);">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          ${details.imageUrl ? `
          <td style="width: 80px; vertical-align: top; padding-right: 14px;">
            <img src="${details.imageUrl}" alt="${item.title}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 10px; border: 1px solid #f4b8c7;" />
          </td>` : ''}
          <td style="vertical-align: top;">
            <div style="font-weight: 800; color: #5c2533; font-size: 15px; font-family: Georgia, serif;">${item.title}</div>
            <div style="font-size: 12px; color: #b76e79; font-weight: 700; margin-top: 2px;">
              Quantity: ${item.quantity} × ₹${item.price} &nbsp;•&nbsp; <span style="color: #5c2533;">Total: ₹${item.price * item.quantity}</span>
            </div>
            
            <!-- Detailed Description of the Product -->
            <div style="font-size: 12px; color: #5e5254; line-height: 1.5; margin-top: 8px; background: #fff9fa; padding: 8px 12px; border-radius: 8px; border-left: 3px solid #b76e79;">
              <strong style="color: #5c2533;">Product Overview:</strong> ${details.detailedDescription}
            </div>
          </td>
        </tr>
      </table>

      <!-- Product & Craftsmanship Specifications -->
      <div style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed #fce7f0;">
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #8c5263; margin-bottom: 8px;">
          🌸 Detailed Product Specifications & Customizations:
        </div>
        <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
          <tr>
            <td style="padding: 3px 0; color: #7a4654; width: 45%;"><strong>Flower Composition:</strong></td>
            <td style="padding: 3px 0; color: #3d1822; text-align: right;">${details.flowerCount} × ${details.flowerType}</td>
          </tr>
          <tr>
            <td style="padding: 3px 0; color: #7a4654;"><strong>Selected Colors:</strong></td>
            <td style="padding: 3px 0; color: #3d1822; text-align: right; font-weight: 600;">${details.colors}</td>
          </tr>
          <tr>
            <td style="padding: 3px 0; color: #7a4654;"><strong>Floral Wrapping:</strong></td>
            <td style="padding: 3px 0; color: #3d1822; text-align: right;">${details.wrapping}</td>
          </tr>
          <tr>
            <td style="padding: 3px 0; color: #7a4654;"><strong>Satin Ribbon Bow:</strong></td>
            <td style="padding: 3px 0; color: #3d1822; text-align: right;">${details.ribbon}</td>
          </tr>
          ${details.hasPearls ? `
          <tr>
            <td style="padding: 3px 0; color: #7a4654;"><strong>Center Pearls:</strong></td>
            <td style="padding: 3px 0; color: #3d1822; text-align: right;">✨ Embedded luminous pearl at flower centers</td>
          </tr>` : ''}
          ${details.hasFairyLights ? `
          <tr>
            <td style="padding: 3px 0; color: #7a4654;"><strong>Warm Fairy Lights:</strong></td>
            <td style="padding: 3px 0; color: #16a34a; text-align: right; font-weight: bold;">💡 Micro-LED lights included</td>
          </tr>` : ''}
          ${details.cardMessage ? `
          <tr>
            <td style="padding: 3px 0; color: #7a4654; vertical-align: top;"><strong>Printed Keepsake Card:</strong></td>
            <td style="padding: 3px 0; color: #5c2533; text-align: right; font-style: italic; font-weight: 600;">"${details.cardMessage}"</td>
          </tr>` : ''}
          ${details.giftTag ? `
          <tr>
            <td style="padding: 3px 0; color: #7a4654;"><strong>Gift Tag:</strong></td>
            <td style="padding: 3px 0; color: #3d1822; text-align: right;">${details.giftTag}</td>
          </tr>` : ''}
        </table>
      </div>
    </div>
    `;
  }).join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your Flora7 Order Confirmation - ${order.orderNumber}</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fdf6f7; margin: 0; padding: 24px 12px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #fce7f0; box-shadow: 0 4px 20px rgba(183, 110, 121, 0.1);">
      
      <!-- Top Banner -->
      <div style="background: linear-gradient(135deg, #5c2533 0%, #b76e79 100%); padding: 30px 20px; text-align: center; color: #ffffff;">
        <div style="font-size: 24px; font-weight: 800; letter-spacing: 2px;">FLORA7</div>
        <div style="font-size: 11px; letter-spacing: 3px; color: #fce7f0; margin-top: 3px;">LOVE UNFOLDED • HANDMADE BLOOMS</div>
        <div style="margin-top: 16px; font-size: 16px; font-weight: 700;">🌸 Order Confirmed! Thank You, ${order.customerName}!</div>
      </div>

      <div style="padding: 24px;">
        <p style="font-size: 14px; color: #3d1822; line-height: 1.6; margin-top: 0;">
          We are delighted to confirm that your Flora7 order <strong>${order.orderNumber}</strong> has been received! Shwetha is already preparing your everlasting satin ribbon flowers with utmost love, patience, and meticulous craftsmanship.
        </p>

        <!-- Order & Fulfillment Box -->
        <div style="background: #fff9fa; border: 1px solid #fce7f0; border-radius: 14px; padding: 16px; margin: 20px 0; font-size: 13px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 5px 0; color: #8c5263; width: 40%;">Order Number:</td>
              <td style="padding: 5px 0; font-weight: 800; color: #5c2533; text-align: right;">${order.orderNumber}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #8c5263;">Delivery / Pickup Date:</td>
              <td style="padding: 5px 0; font-weight: 700; color: #3d1822; text-align: right;">${order.deliveryDate} (${order.preferredSlot || 'Standard'})</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #8c5263; vertical-align: top;">Fulfillment Details:</td>
              <td style="padding: 5px 0; font-weight: 600; color: #3d1822; text-align: right;">
                ${order.isPickup ? '🛍️ Studio Self-Pickup (Flora7 Studio, Koramangala 4th Block, Bangalore)' : `🚚 Home Delivery: ${order.shippingAddress} ${order.landmark ? `(Landmark: ${order.landmark})` : ''} ${order.pincode ? `(${order.pincode})` : ''}`}
              </td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #8c5263;">Payment:</td>
              <td style="padding: 5px 0; font-weight: 700; color: #166534; text-align: right;">${order.paymentMethod} • ${order.paymentStatus}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #8c5263;">Order Status:</td>
              <td style="padding: 5px 0; font-weight: 800; color: #b76e79; text-align: right;">Confirmed & Preparing</td>
            </tr>
          </table>
        </div>

        ${order.giftMessage ? `
        <div style="background: #fdf2f4; border: 1px dashed #b76e79; border-radius: 12px; padding: 12px 16px; margin-bottom: 20px; font-size: 13px;">
          <strong style="color: #5c2533;">💌 Keepsake Card Message:</strong> <em>"${order.giftMessage}"</em>
        </div>` : ''}

        <!-- Detailed Product Breakdown -->
        <div style="margin: 24px 0 16px 0;">
          <div style="font-weight: 800; color: #5c2533; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; border-bottom: 2px solid #fce7f0; padding-bottom: 6px;">
            Your Ordered Products & Details (${order.items.length})
          </div>
          ${itemsCards}
        </div>

        <!-- Price Summary -->
        <div style="background: #faf5f6; border-radius: 14px; padding: 16px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 4px 0; color: #7a4654;">Subtotal:</td>
              <td style="padding: 4px 0; font-weight: 600; text-align: right; color: #3d1822;">₹${order.subtotal}</td>
            </tr>
            ${order.discountAmount ? `
            <tr>
              <td style="padding: 4px 0; color: #166534;">Coupon Discount (${order.couponCode || ''}):</td>
              <td style="padding: 4px 0; font-weight: 600; text-align: right; color: #166534;">-₹${order.discountAmount}</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 4px 0; color: #7a4654;">Delivery:</td>
              <td style="padding: 4px 0; font-weight: 600; text-align: right; color: #3d1822;">${order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</td>
            </tr>
            <tr style="border-top: 1.5px solid #f4b8c7;">
              <td style="padding: 8px 0 2px 0; font-weight: 800; font-size: 15px; color: #5c2533;">Total Paid:</td>
              <td style="padding: 8px 0 2px 0; font-weight: 800; font-size: 17px; text-align: right; color: #b76e79;">₹${order.totalAmount}</td>
            </tr>
          </table>
        </div>

        <!-- Care Guide -->
        <div style="background: #fff9fa; border-left: 3px solid #b76e79; border-radius: 8px; padding: 12px 14px; margin-bottom: 24px; font-size: 12px; color: #5e5254; line-height: 1.5;">
          <strong style="color: #5c2533;">🌸 Keepsake Flower Care:</strong> Unlike fresh flowers, your Flora7 handmade satin blooms will never wilt, fade, or dry! Keep them away from open flames and extreme dampness. If dust settles over time, lightly blow with a hairdryer on the cool setting.
        </div>

        <!-- Action Button -->
        <div style="text-align: center; margin: 24px 0;">
          <a href="${appUrl}/my-orders" style="display: inline-block; background: #b76e79; color: #ffffff; font-weight: 700; font-size: 13px; text-decoration: none; padding: 12px 28px; border-radius: 30px; box-shadow: 0 4px 12px rgba(183, 110, 121, 0.25);">
            Track Your Order Live →
          </a>
        </div>

        <!-- Contact Support -->
        <div style="font-size: 12px; color: #8c5263; line-height: 1.6; text-align: center; border-top: 1px solid #fce7f0; padding-top: 18px;">
          Have questions or want to customize your card message? You can reply directly to this email at <a href="mailto:flora7loveunfolded@gmail.com" style="color: #b76e79; font-weight: 700; text-decoration: none;">flora7loveunfolded@gmail.com</a> or message Shwetha on WhatsApp: <strong>+91 98450 12345</strong>.<br />
          Follow our creations on Instagram: <a href="https://instagram.com/flora7loveunfolded" style="color: #b76e79; font-weight: 700; text-decoration: none;">@flora7loveunfolded</a>.
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #fff9fa; border-top: 1px solid #fce7f0; padding: 14px; text-align: center; font-size: 11px; color: #8c5263;">
        Flora7 • Forever Satin Blooms Crafted by Shwetha • Sent through flora7loveunfolded@gmail.com
      </div>
    </div>
  </body>
  </html>
  `;
}

// Generate Offline Booking Notification HTML for Owner
export function generateOfflineBookingEmailHtml(booking: OfflineBooking, appUrl: string = 'https://flora7.com'): string {
  return `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8" /></head>
  <body style="font-family: sans-serif; background-color: #fdf6f7; padding: 24px 12px;">
    <div style="max-width: 580px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 24px; border: 1px solid #fce7f0;">
      <div style="background: #5c2533; color: #fff; padding: 16px; border-radius: 12px; text-align: center;">
        <h2 style="margin: 0; font-size: 18px;">🌸 NEW CUSTOM / OFFLINE BOOKING</h2>
        <div style="font-size: 12px; color: #f4b8c7; margin-top: 4px;">Ref: ${booking.bookingNumber}</div>
      </div>
      <div style="margin-top: 20px; font-size: 14px; color: #3d1822; line-height: 1.6;">
        <p><strong>Customer Name:</strong> ${booking.customerName}</p>
        <p><strong>Phone:</strong> <a href="tel:${booking.customerPhone}">${booking.customerPhone}</a></p>
        <p><strong>Email:</strong> ${booking.customerEmail || 'Not provided'}</p>
        <p><strong>Concept / Product:</strong> ${booking.productOrConcept}</p>
        <p><strong>Quantity:</strong> ${booking.quantity}</p>
        <p><strong>Required By Date:</strong> ${booking.preferredDate}</p>
        <p><strong>Type:</strong> ${booking.deliveryOrPickup}</p>
        <p><strong>Custom Notes:</strong> ${booking.customDetails}</p>
        ${booking.shippingAddress ? `<p><strong>Address:</strong> ${booking.shippingAddress}</p>` : ''}
      </div>
      <div style="text-align: center; margin-top: 24px;">
        <a href="${appUrl}/admin/dashboard" style="background: #b76e79; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 20px; font-weight: 700;">
          View & Quote in Owner Portal
        </a>
      </div>
    </div>
  </body>
  </html>
  `;
}

// Master email dispatcher function
export async function sendEmail({
  to,
  subject,
  html,
  text,
  recipientType = 'OWNER',
  orderId,
  orderNumber
}: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  recipientType?: 'OWNER' | 'CUSTOMER';
  orderId?: string;
  orderNumber?: string;
}): Promise<{ success: boolean; status: 'SENT' | 'LOGGED' | 'FAILED'; messageId?: string; error?: string }> {
  const settings = db.getEmailSettings();
  const recipients = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean);

  if (recipients.length === 0) {
    return { success: false, status: 'FAILED', error: 'No recipient email specified' };
  }

  const toAddress = recipients.join(', ');
  const fromAddress = 'Flora7 Studio <flora7loveunfolded@gmail.com>';

  const transporter = getTransporter(settings);

  let status: 'SENT' | 'LOGGED' | 'FAILED' = 'LOGGED';
  let errorMessage: string | undefined;
  let messageId: string | undefined;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: fromAddress,
        replyTo: 'flora7loveunfolded@gmail.com',
        to: toAddress,
        subject,
        text,
        html
      });
      status = 'SENT';
      messageId = info.messageId;
      console.log(`[Email Dispatch] Successfully sent email to ${toAddress}: ${subject}`);
    } catch (err: any) {
      console.error(`[Email Dispatch Error] Failed to send via SMTP to ${toAddress}:`, err.message);
      status = 'FAILED';
      errorMessage = err.message;
    }
  } else {
    // When SMTP credentials are not yet configured in environment/settings,
    // we log the email reliably into the system so the owner can preview it and no orders are lost.
    status = 'LOGGED';
    console.log(`[Email Logged] No active SMTP transporter. Stored in Owner Email Dispatch Log for ${toAddress}: "${subject}"`);
  }

  // Record into persistent database emailLogs
  db.addEmailLog({
    orderId,
    orderNumber,
    recipient: toAddress,
    recipientType,
    subject,
    htmlBody: html,
    textBody: text,
    status,
    errorMessage
  });

  return {
    success: status !== 'FAILED',
    status,
    messageId,
    error: errorMessage
  };
}

// Higher-level order notification dispatcher
export async function notifyNewOrder(order: Order, appUrl: string = 'https://flora7.com') {
  const settings = db.getEmailSettings();

  // 1. Add alert to Owner Dashboard Notifications Center
  db.addOwnerAlert({
    type: 'NEW_ORDER',
    title: `New Order: ${order.orderNumber}`,
    message: `${order.customerName} placed an order for ₹${order.totalAmount} (${order.items.length} item${order.items.length > 1 ? 's' : ''})`,
    orderId: order.id,
    orderNumber: order.orderNumber,
    amount: order.totalAmount,
    customerName: order.customerName
  });

  // 2. Dispatch Email to Owner flora7loveunfolded@gmail.com with all order details
  const ownerRecipients = Array.from(new Set([
    'flora7loveunfolded@gmail.com',
    ...(settings.ownerEmails || [])
  ])).filter(Boolean);

  const subject = `🌸 New Flora7 Order: ${order.orderNumber} from ${order.customerName} (₹${order.totalAmount})`;
  const html = generateOwnerOrderEmailHtml(order, appUrl);
  const text = generateOwnerOrderEmailText(order, appUrl);

  await sendEmail({
    to: ownerRecipients,
    subject,
    html,
    text,
    recipientType: 'OWNER',
    orderId: order.id,
    orderNumber: order.orderNumber
  });

  // 3. Dispatch Confirmation Email to Customer with detailed product description through flora7loveunfolded@gmail.com
  if (order.customerEmail) {
    const customerSubject = `🌸 Order Confirmed: ${order.orderNumber} - Your Flora7 Handmade Bouquet is in the Works!`;
    const customerHtml = generateCustomerOrderEmailHtml(order, appUrl);
    const customerText = `Hi ${order.customerName},\nThank you for ordering at Flora7! Your order ${order.orderNumber} for ₹${order.totalAmount} has been confirmed.\n\nItems: ${order.items.map(i => `${i.quantity}x ${i.title}`).join(', ')}\n\nTrack your order at: ${appUrl}/my-orders`;

    await sendEmail({
      to: order.customerEmail,
      subject: customerSubject,
      html: customerHtml,
      text: customerText,
      recipientType: 'CUSTOMER',
      orderId: order.id,
      orderNumber: order.orderNumber
    });
  }
}

// Status update notification
export async function notifyOrderStatusUpdate(order: Order, appUrl: string = 'https://flora7.com') {
  const settings = db.getEmailSettings();

  db.addOwnerAlert({
    type: 'SYSTEM',
    title: `Order Updated: ${order.orderNumber}`,
    message: `Order status changed to ${order.orderStatus} for ${order.customerName}`,
    orderId: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName
  });

  // 1. Dispatch Email to Owner flora7loveunfolded@gmail.com with complete order details
  // Ensures owner receives full order specifications even after the product is delivered or updated
  const ownerRecipients = Array.from(new Set([
    'flora7loveunfolded@gmail.com',
    ...(settings.ownerEmails || [])
  ])).filter(Boolean);

  const isDelivered = order.orderStatus === 'DELIVERED';
  const ownerSubject = isDelivered
    ? `🌸 [Delivered & Completed] Order ${order.orderNumber} - ${order.customerName} (₹${order.totalAmount})`
    : `🌸 [Status Update: ${order.orderStatus}] Order ${order.orderNumber} - ${order.customerName} (₹${order.totalAmount})`;

  const ownerHtml = generateOwnerOrderEmailHtml(order, appUrl);
  const ownerText = generateOwnerOrderEmailText(order, appUrl);

  await sendEmail({
    to: ownerRecipients,
    subject: ownerSubject,
    html: ownerHtml,
    text: ownerText,
    recipientType: 'OWNER',
    orderId: order.id,
    orderNumber: order.orderNumber
  });

  // 2. Dispatch update to customer if customer email exists
  if (settings.notifyCustomerOnStatusChange && order.customerEmail) {
    const subject = `🌸 Flora7 Order Update: ${order.orderNumber} is now ${order.orderStatus}`;
    const html = generateCustomerOrderEmailHtml(order, appUrl);
    const text = `Your Flora7 order ${order.orderNumber} status has been updated to: ${order.orderStatus}.`;

    await sendEmail({
      to: order.customerEmail,
      subject,
      html,
      text,
      recipientType: 'CUSTOMER',
      orderId: order.id,
      orderNumber: order.orderNumber
    });
  }
}

// Offline booking notification
export async function notifyOfflineBooking(booking: OfflineBooking, appUrl: string = 'https://flora7.com') {
  const settings = db.getEmailSettings();

  db.addOwnerAlert({
    type: 'CUSTOM_BOOKING',
    title: `Custom Bouquet Request: ${booking.bookingNumber}`,
    message: `${booking.customerName} requested custom bouquet (${booking.productOrConcept})`,
    customerName: booking.customerName
  });

  if (settings.notifyOnCustomBooking) {
    const ownerRecipients = settings.ownerEmails && settings.ownerEmails.length > 0 
      ? settings.ownerEmails 
      : ['flora7loveunfolded@gmail.com'];

    const subject = `🌸 New Custom Bouquet Request: ${booking.bookingNumber} from ${booking.customerName}`;
    const html = generateOfflineBookingEmailHtml(booking, appUrl);
    const text = `New custom booking ${booking.bookingNumber}\nCustomer: ${booking.customerName} (${booking.customerPhone})\nConcept: ${booking.productOrConcept}`;

    await sendEmail({
      to: ownerRecipients,
      subject,
      html,
      text,
      recipientType: 'OWNER'
    });
  }
}
