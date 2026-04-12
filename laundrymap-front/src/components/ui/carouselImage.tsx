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




interface CarouselWithThumbsProps {
  files?: FileList | null
}


export default function CarouselWithThumbs({ files }: CarouselWithThumbsProps) {

  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(1);

  // utilise les fichiers uploadés sinon utilise une image de test
  const imageUrls = React.useMemo(() => {
    if (files && files.length > 0) {
      return Array.from(files).map((file) => URL.createObjectURL(file))
    }
    return [ "https://www.fffuel.co/images/dddepth-preview/dddepth-248.jpg" ];
  }, [files])

  // Libérer les object URLs quand le composant se démonte
  React.useEffect(() => {
    return () => {
      if (files) {
        imageUrls.forEach((url) => URL.revokeObjectURL(url))
      }
    }
  }, [imageUrls, files])




  React.useEffect(() => {
    if (!api) {
      return;
    }

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
          {imageUrls.map((url) => (
            <CarouselItem key={url}>
              <img
                alt="Image Principale de la Laverie"
                className="size-full rounded-xl object-cover"
                src={url}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <Carousel className="mt-4 w-full max-w-xs">
        <div className="mask-x-from-90%">
          <CarouselContent className="my-1 flex">
            {imageUrls.map((url, index) => (
              <CarouselItem
                className={cn(
                  "basis-1/4 cursor-pointer transition-opacity",
                  current === index + 1 ? "opacity-100" : "opacity-50"
                )}
                key={url}
                onClick={() => handleThumbClick(index)}
              >
                <img
                  alt="Images secondaires de la Laverie"
                  className="size-full rounded-xl object-cover"
                  src={url}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </div>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
