export interface Place extends google.maps.places.Place {
  photos?: google.maps.places.Photo[];
}

export async function getPlacePhotoUri(placeId: string): Promise<string | null> {
  // Configure the Loader
  google.maps.importLibrary;

  const { Place } = await google.maps.importLibrary("places") as google.maps.PlacesLibrary;

  const place = new Place({ id: placeId });

  try {
    await place.fetchFields({ fields: ["photos"] });

    const photos = place.photos;

    if (photos && photos.length > 0) {
      return photos[0].getURI();
    }

    return null;
  } catch (error) {
    console.error("Error fetching place photos:", error);
    return null;
  }
}