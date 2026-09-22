import React from 'react';
import { Instagram, Heart } from 'lucide-react';

export const InstagramGallery: React.FC = () => {
  const posts = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&q=80&w=800',
      likes: '342',
      caption: '7 Rose Satin Bouquet in Blush Pink 🌸 #Flora7 #HandmadeRoses'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800',
      likes: '512',
      caption: 'Single satin rose wrapped with love and pearl core ✨'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=800',
      likes: '289',
      caption: 'Bespoke wedding anniversary order ready for dispatch 💗'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&q=80&w=800',
      likes: '620',
      caption: 'Royal 9-rose grand bouquet with warm LED fairy lights ✨'
    }
  ];

  return (
    <section className="py-12 bg-[#FFF9FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#B76E79]">
            <Instagram className="w-4 h-4 text-[#E1306C]" />
            <span>@_.FLORA7._</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#5C2533]">
            Follow Flora7 on Instagram
          </h2>
          <p className="text-xs text-[#7A6B6E]">
            Peek behind the scenes into Shwetha’s studio as ribbon petals unfold into eternal blooms.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {posts.map((post) => (
            <a
              key={post.id}
              href="https://www.instagram.com/_.flora7._/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-3xl overflow-hidden shadow-xs border border-[#FCE7F0] block"
            >
              <img
                src={post.image}
                alt={post.caption}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-white text-center">
                <Heart className="w-6 h-6 fill-white text-white mb-1" />
                <span className="text-xs font-bold">{post.likes} likes</span>
                <p className="text-[10px] opacity-90 line-clamp-2 mt-1 font-light">{post.caption}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
