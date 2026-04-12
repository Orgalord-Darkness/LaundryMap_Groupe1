// import * as React from "react";
// import { cn } from "@/lib/utils";
// import {
//   Carousel,
//   type CarouselApi,
//   CarouselContent,
//   CarouselItem,
//   CarouselNext,
//   CarouselPrevious,
// } from "@/components/ui/carousel";

// const FALLBACK_URL = "https://www.fffuel.co/images/dddepth-preview/dddepth-248.jpg"

// interface CarouselWithThumbsProps {
//   files?: FileList | null
// }


// export default function CarouselWithThumbs({ files }: CarouselWithThumbsProps) {

//   const [api, setApi] = React.useState<CarouselApi>();
//   const [current, setCurrent] = React.useState(1);
//   const [imageUrls, setImageUrls] = React.useState<string[]>([FALLBACK_URL]);

//   // Crée les blob URLs dans un useEffect pour éviter le problème de Strict Mode
//   // (useMemo avec createObjectURL = side-effect révoqué par le double-invoke du Strict Mode)
//   React.useEffect(() => {
//     if (!files || files.length === 0) {
//       setImageUrls([FALLBACK_URL])
//       return
//     }
//     const urls = Array.from(files).map(f => URL.createObjectURL(f))
//     setImageUrls(urls)
//     return () => { urls.forEach(u => URL.revokeObjectURL(u)) }
//   }, [files])




//   React.useEffect(() => {
//     if (!api) {
//       return;
//     }

//     setCurrent(api.selectedScrollSnap() + 1);

//     api.on("select", () => {
//       setCurrent(api.selectedScrollSnap() + 1);
//     });
//   }, [api]);

//   const handleThumbClick = React.useCallback(
//     (index: number) => {
//       api?.scrollTo(index);
//     },
//     [api]
//   );

//   return (
//     <div className="mx-auto max-w-xs">
//       <Carousel className="w-full max-w-xs" setApi={setApi}>
//         <CarouselContent>
//           {imageUrls.map((url) => (
//             <CarouselItem key={url}>
//               <img
//                 alt="Image Principale de la Laverie"
//                 className="size-full rounded-xl object-cover"
//                 src={url}
//               />
//             </CarouselItem>
//           ))}
//         </CarouselContent>
//       </Carousel>

//       <Carousel className="mt-4 w-full max-w-xs">
//         <div className="mask-x-from-90%">
//           <CarouselContent className="my-1 flex">
//             {imageUrls.map((url, index) => (
//               <CarouselItem
//                 className={cn(
//                   "basis-1/4 cursor-pointer transition-opacity",
//                   current === index + 1 ? "opacity-100" : "opacity-50"
//                 )}
//                 key={url}
//                 onClick={() => handleThumbClick(index)}
//               >
//                 <img
//                   alt="Images secondaires de la Laverie"
//                   className="size-full rounded-xl object-cover"
//                   src={url}
//                 />
//               </CarouselItem>
//             ))}
//           </CarouselContent>
//         </div>
//         <CarouselPrevious />
//         <CarouselNext />
//       </Carousel>
//     </div>
//   );
// }

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const FALLBACK_URL = "https://www.fffuel.co/images/dddepth-preview/dddepth-248.jpg"

interface CarouselWithThumbsProps {
  files?: FileList | null
}

export default function CarouselWithThumbs({ files }: CarouselWithThumbsProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(1);
  const [imageUrls, setImageUrls] = React.useState<string[]>([]);

  // Gestion robuste des URLs de prévisualisation
  React.useEffect(() => {
    if (!files || files.length === 0) {
      setImageUrls([FALLBACK_URL]);
      return;
    }

    const urls = Array.from(files).map(f => URL.createObjectURL(f));
    setImageUrls(urls);

    // Nettoyage automatique des URLs pour éviter les fuites de mémoire
    return () => {
      urls.forEach(u => URL.revokeObjectURL(u));
    };
  }, [files]);

  React.useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const handleThumbClick = React.useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api]
  );

  return (
    <div className="mx-auto max-w-xs">
      <Carousel className="w-full max-w-xs" setApi={setApi}>
        <CarouselContent>
          {imageUrls.map((url, index) => (
            <CarouselItem key={`${url}-${index}`}>
              <img
                alt="Prévisualisation"
                className="size-full rounded-xl object-cover aspect-video"
                src={url}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {imageUrls.length > 1 && (
        <Carousel className="mt-4 w-full max-w-xs">
          <div className="mask-x-from-90%">
            <CarouselContent className="my-1 flex">
              {imageUrls.map((url, index) => (
                <CarouselItem
                  className={cn(
                    "basis-1/4 cursor-pointer transition-opacity",
                    current === index + 1 ? "opacity-100" : "opacity-50"
                  )}
                  key={`thumb-${url}-${index}`}
                  onClick={() => handleThumbClick(index)}
                >
                  <img
                    alt="Miniature"
                    className="size-full rounded-xl object-cover aspect-square"
                    src={url}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </div>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      )}
    </div>
  );
}