"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useQuery, gql } from "@apollo/client";

const GET_ADMIN_LOCATIONS = gql`
  query Query {
    admins {
      lat
      lng
    }
  }
`;


interface MapMarker {
  locationName: string;
  lat: number;
  lng: number;
  address: string;
}

interface MapOptions {
  mapId: string | undefined;
  center: google.maps.LatLngLiteral;
  zoom: number;
  disableDefaultUI: boolean;
}

const mapOptions: MapOptions = {
  mapId: process.env.NEXT_PUBLIC_MAPID,
  center: { lat: 18.517436621033905, lng: 73.8560968090087 },
  zoom: 15,
  disableDefaultUI: true,
};

const Response = () => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const threeRendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number>(0);

  const { loading, error, data } = useQuery(GET_ADMIN_LOCATIONS, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      console.log('GraphQL Data:', data);
    },
    onError: (error) => {
      console.error('GraphQL Error:', error);
    },
  });

  useEffect(() => {
    if (!data?.admins) {
      console.log('No data available yet');
      return;
    }

    console.log('Processing data:', data);

    const markers: MapMarker[] = data?.admins.map((admin: { lat: number; lng: number }) => ({
      locationName: "Admin Location",
      lat: admin.lat,
      lng: admin.lng,
      address: "Admin Address"
    })) || [];

    const initMap = (): void => {
      const mapElement = document.getElementById("google-map");
      if (!mapElement) return;

      const map = new google.maps.Map(mapElement, mapOptions);
      mapRef.current = map;

      const locationButton = document.createElement("button");
      Object.assign(locationButton.style, {
        color: "#32CD32",
        fontSize: "1rem",
        margin: "10px",
        padding: "10px",
        backgroundColor: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        position: "absolute",
        bottom: "10px",
        left: "50%",
        transform: "translateX(-50%)",
      });

      locationButton.textContent = "Pan to Current Location";
      locationButton.classList.add("custom-map-control-button");
      map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(locationButton);

      const infoWindow = new google.maps.InfoWindow({
        minWidth: 200,
        maxWidth: 200,
      });

      locationButton.addEventListener("click", () => {
        handleGeolocation(map, infoWindow);
      });

      const bounds = new google.maps.LatLngBounds();

      markers.forEach((value) => {
        try {
          const marker = new google.maps.Marker({
            position: { lat: value.lat, lng: value.lng },
            map: map,
            draggable: false,
            animation: google.maps.Animation.DROP,
            icon: {
              url: "/icon/work-location.png",
            }
          });

          createInfoWindow(marker, map, infoWindow, value);
          bounds.extend(new google.maps.LatLng(value.lat, value.lng));
        } catch (error) {
          console.error('Error creating marker:', error);
        }
      }, [loading, error, data]);

      map.fitBounds(bounds);

      initThreeJS(mapElement);
    };

    const handleGeolocation = (
      map: google.maps.Map,
      infoWindow: google.maps.InfoWindow
    ): void => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            infoWindow.setPosition(pos);
            infoWindow.setContent(`
              <h1 class='text-black'>Location found.</h1>
            `);
            infoWindow.open(map);
            map.setCenter(pos);
          },
          () => {
            handleLocationError(true, infoWindow, map.getCenter() as google.maps.LatLng);
          }
        );
      } else {
        handleLocationError(false, infoWindow, map.getCenter() as google.maps.LatLng);
      }
    };

    const createInfoWindow = (
      marker: google.maps.Marker,
      map: google.maps.Map,
      infoWindow: google.maps.InfoWindow,
      value: MapMarker
    ): void => {

      marker.addListener("click", () => {
        map.moveCamera({
          center: { lat: value.lat, lng: value.lng },
          heading: 0,
          tilt: 45,
          zoom: 19.90,
        });

        let heading = 0;

        const rotate = () => {
          heading = (heading + 0.1) % 360;
          map.moveCamera({ heading });
          animationFrameRef.current = requestAnimationFrame(rotate);
        };

        rotate();

        map.addListener("mousedown", () => {
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }
        });
      });
    };

    const initThreeJS = (mapElement: HTMLElement): void => {
      const renderer = new THREE.WebGLRenderer({ alpha: true });
      threeRendererRef.current = renderer;
      renderer.setSize(window.innerWidth, window.innerHeight);
      mapElement.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.z = 5;

      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);

      const animate = () => {
        animationFrameRef.current = requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
      };

      animate();
    };

    const handleLocationError = (
      browserHasGeolocation: boolean,
      infoWindow: google.maps.InfoWindow,
      pos: google.maps.LatLng | null
    ): void => {
      if (!pos || !mapRef.current) return;
      
      infoWindow.setPosition(pos);
      infoWindow.setContent(
        browserHasGeolocation
          ? "Error: The Geolocation service failed."
          : "Error: Your browser doesn't support geolocation."
      );
      infoWindow.open(mapRef.current);
    };

    const script = document.createElement("script");
    script.src = process.env.NEXT_PUBLIC_GOOGLEMAP_URI || "";
    script.defer = true;
    script.async = true;
    window.initMap = initMap;
    document.head.appendChild(script);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (threeRendererRef.current) {
        threeRendererRef.current.dispose();
      }
      if (mapRef.current) {
        // Clean up map instance if needed
      }
    };
  }, [data]);


  if (loading) return <div>Loading map data...</div>;
  if (error) return <div>Error loading map data: {error.message}</div>;
  if (!data?.admins) return <div>No locations found</div>;  

  return (
    <div className="relative w-full">
      <div
        className="google-map flex border-2 border-black w-screen h-screen justify-center align-center"
        id="google-map"
      ></div>
    </div>
  );
};

// Add global type declaration for initMap
declare global {
  interface Window {
    initMap: () => void;
  }
}

export default Response;