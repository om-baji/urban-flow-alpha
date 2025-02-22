"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useQuery, gql } from "@apollo/client";
import Sidebar from "@/components/sidebar";

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
  accidents?: {
    today: number;
    overall: number;
  };
  violations?: {
    total: number;
    reported: number;
  };
  challans?: {
    total: number;
    collected_amount: number;
  };
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
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);

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
    if (!data?.admins) return;

    const markers: MapMarker[] = data.admins.map((admin: { lat: number; lng: number }) => ({
      locationName: "Admin Location",
      lat: admin.lat,
      lng: admin.lng,
      address: "Admin Address"
    }));

    const handleMarkerClick = (value: MapMarker) => {
      setSelectedMarker(value);
      setIsSidebarOpen(true);
    };

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

          marker.addListener("click", () => {
            handleMarkerClick(value);

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

          bounds.extend(new google.maps.LatLng(value.lat, value.lng));
        } catch (error) {
          console.error('Error creating marker:', error);
        }
      });

      map.fitBounds(bounds);
      initThreeJS(mapElement);

      locationButton.addEventListener("click", () => {
        handleGeolocation(map);
      });
    };

    const handleGeolocation = (map: google.maps.Map): void => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            map.setCenter(pos);
            map.setZoom(15);
          },
          () => {
            console.error('Error: The Geolocation service failed.');
          }
        );
      } else {
        console.error('Error: Your browser doesn\'t support geolocation.');
      }
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
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        markerData={selectedMarker}
      />
    </div>
  );
};

declare global {
  interface Window {
    initMap: () => void;
  }
}

export default Response;