'use client'

import { Dialog } from '@base-ui/react/dialog'
import { ArrowsOutIcon, ArrowLeftIcon, ArrowRightIcon, XIcon } from '@phosphor-icons/react'
import { useRef, useState } from 'react'
import type { Swiper as SwiperInstance } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'

import { Button } from '@/components/ui/button'
import type { SiteLocale } from '@/lib/locale'

export type AccommodationGalleryImage = {
  id: string
  src: string
  alt: string
  caption?: string | null
}

export function AccommodationGallery({ images, locale, name }: { images: AccommodationGalleryImage[]; locale: SiteLocale; name: string }) {
  const mainSwiper = useRef<SwiperInstance | null>(null)
  const lightboxSwiper = useRef<SwiperInstance | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const multiple = images.length > 1
  const nextImages = Array.from({ length: Math.min(images.length - 1, 4) }, (_, offset) => (activeIndex + offset + 1) % images.length)

  function openLightbox(index: number) {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  function changeLightboxOpen(open: boolean) {
    setLightboxOpen(open)
    if (!open && multiple) mainSwiper.current?.slideToLoop(lightboxIndex, 0)
  }

  return <>
    <section className="site-room-carousel" aria-label={locale === 'de' ? `Bilder von ${name}` : `Photos of ${name}`}>
      <Swiper
        className="site-room-carousel__swiper"
        slidesPerView={1}
        loop={multiple}
        onSwiper={(swiper) => { mainSwiper.current = swiper }}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
      >
        {images.map((image, index) => <SwiperSlide key={image.id}>
          <figure className="site-room-carousel__figure">
            <Button type="button" variant="ghost" className="site-room-carousel__open" onClick={() => openLightbox(index)} aria-label={locale === 'de' ? `Bild ${index + 1} in voller Größe öffnen` : `Open image ${index + 1} at full size`}>
              {/* Payload's upload URL can point to local storage or Vercel Blob. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.src} alt={image.alt} loading={index === 0 ? 'eager' : 'lazy'} fetchPriority={index === 0 ? 'high' : undefined} />
              <span className="site-room-carousel__open-label"><ArrowsOutIcon aria-hidden="true" />{locale === 'de' ? 'Bild öffnen' : 'Open image'}</span>
            </Button>
            {image.caption && <figcaption>{image.caption}</figcaption>}
          </figure>
        </SwiperSlide>)}
      </Swiper>
      {multiple && <div className="site-room-carousel__controls">
        <div className="site-room-carousel__navigation">
          <Button type="button" variant="secondary" size="icon" className="site-room-carousel__arrow" onClick={() => mainSwiper.current?.slidePrev()} aria-label={locale === 'de' ? 'Vorheriges Bild' : 'Previous image'}><ArrowLeftIcon aria-hidden="true" /></Button>
          <Button type="button" variant="secondary" size="icon" className="site-room-carousel__arrow" onClick={() => mainSwiper.current?.slideNext()} aria-label={locale === 'de' ? 'Nächstes Bild' : 'Next image'}><ArrowRightIcon aria-hidden="true" /></Button>
          <span className="site-room-carousel__count" aria-live="polite">{String(activeIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</span>
        </div>
        <div className="site-room-carousel__previews" aria-label={locale === 'de' ? 'Weitere Bilder' : 'More images'}>
          {nextImages.map((index) => <Button key={images[index].id} type="button" variant="ghost" className="site-room-carousel__preview" onClick={() => mainSwiper.current?.slideToLoop(index)} aria-label={locale === 'de' ? `Bild ${index + 1} anzeigen` : `Show image ${index + 1}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images[index].src} alt="" loading="lazy" />
          </Button>)}
        </div>
      </div>}
    </section>

    <Dialog.Root open={lightboxOpen} onOpenChange={changeLightboxOpen}>
      <Dialog.Portal>
        <Dialog.Backdrop className="site-lightbox__backdrop" />
        <Dialog.Popup className="site-lightbox" onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') { event.preventDefault(); lightboxSwiper.current?.slidePrev() }
          if (event.key === 'ArrowRight') { event.preventDefault(); lightboxSwiper.current?.slideNext() }
        }}>
          <Dialog.Title className="sr-only">{locale === 'de' ? `Bilder von ${name}` : `Photos of ${name}`}</Dialog.Title>
          <Button render={<Dialog.Close />} type="button" variant="secondary" size="icon" className="site-lightbox__close" aria-label={locale === 'de' ? 'Bildansicht schließen' : 'Close image viewer'}><XIcon aria-hidden="true" /></Button>
          {lightboxOpen && <Swiper
            className="site-lightbox__swiper"
            slidesPerView={1}
            loop={multiple}
            initialSlide={lightboxIndex}
            onSwiper={(swiper) => { lightboxSwiper.current = swiper }}
            onSlideChange={(swiper) => setLightboxIndex(swiper.realIndex)}
          >
            {images.map((image) => <SwiperSlide key={image.id}>
              <figure className="site-lightbox__figure">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.src} alt={image.alt} />
                {image.caption && <figcaption>{image.caption}</figcaption>}
              </figure>
            </SwiperSlide>)}
          </Swiper>}
          {multiple && <div className="site-lightbox__navigation">
            <Button type="button" variant="secondary" size="icon" onClick={() => lightboxSwiper.current?.slidePrev()} aria-label={locale === 'de' ? 'Vorheriges Bild' : 'Previous image'}><ArrowLeftIcon aria-hidden="true" /></Button>
            <span aria-live="polite">{lightboxIndex + 1} / {images.length}</span>
            <Button type="button" variant="secondary" size="icon" onClick={() => lightboxSwiper.current?.slideNext()} aria-label={locale === 'de' ? 'Nächstes Bild' : 'Next image'}><ArrowRightIcon aria-hidden="true" /></Button>
          </div>}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  </>
}
