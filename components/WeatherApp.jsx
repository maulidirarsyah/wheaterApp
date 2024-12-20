"use client";
import React, { useState } from "react";
import { Search, MapPin, Loader2, RefreshCw, Sun, Moon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactAnimatedWeather from "react-animated-weather";

const WeatherApp = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [isCelsius, setIsCelsius] = useState(true); // State untuk satuan suhu

  // Fungsi untuk toggle tema
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Fungsi untuk switch satuan suhu
  const toggleTemperatureUnit = () => {
    setIsCelsius(!isCelsius);
  };

  // Fungsi untuk mencari lokasi
  const searchLocation = async () => {
    if (!searchInput.trim()) {
      setError("Silakan masukkan nama lokasi");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

      // Geocoding API
      const geoResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
          searchInput
        )}&limit=1&appid=${API_KEY}`
      );

      if (!geoResponse.ok) throw new Error("Gagal mencari lokasi");

      const geoData = await geoResponse.json();

      if (!geoData.length) {
        throw new Error("Lokasi tidak ditemukan");
      }

      const { lat, lon } = geoData[0];
      await getWeatherByCoords(lat, lon);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk konversi ikon cuaca dari OpenWeather ke ReactAnimatedWeather
  const getWeatherIcon = (weatherMain) => {
    const iconMapping = {
      Clear: "CLEAR_DAY",
      Clouds: "CLOUDY",
      Rain: "RAIN",
      Snow: "SNOW",
      Thunderstorm: "WIND",
      Drizzle: "SLEET",
      Mist: "FOG",
      Smoke: "FOG",
      Haze: "FOG",
      Dust: "FOG",
      Fog: "FOG",
      Sand: "FOG",
      Ash: "FOG",
      Squall: "WIND",
      Tornado: "WIND",
    };

    return iconMapping[weatherMain] || "CLOUDY"; // Default ke CLOUDY jika tidak cocok
  };

  // Fungsi untuk mendapatkan cuaca berdasarkan koordinat
  const getWeatherByCoords = async (lat, lon) => {
    try {
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=id`
      );

      if (!response.ok) throw new Error("Gagal mengambil data cuaca");

      const data = await response.json();
      setWeatherData(data);
    } catch (error) {
      setError("Gagal mengambil data cuaca. Silakan coba lagi nanti.");
    }
  };

  // Fungsi untuk mendapatkan lokasi saat ini
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolokasi tidak didukung di browser Anda.");
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        getWeatherByCoords(position.coords.latitude, position.coords.longitude);
        setIsLoading(false);
      },
      (error) => {
        setError(
          "Tidak dapat mengakses lokasi Anda. Pastikan izin lokasi diaktifkan."
        );
        setIsLoading(false);
      }
    );
  };

  const convertTemperature = (temp) => {
    return isCelsius ? temp : (temp * 9) / 5 + 32;
  };

  return (
    <div
      className={`min-h-screen p-4 transition-colors duration-200 ${
        isDarkMode ? "bg-slate-900" : "bg-slate-50"
      } relative overflow-hidden`}
    >
      {/* Background Animation */}
      <div
        className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none"
        aria-hidden="true"
      >
        <div className="w-[300px] h-[300px] bg-gradient-to-r from-gray-300 to-gray-400 opacity-50 rounded-full animate-pulse" />
        <div className="w-[400px] h-[400px] bg-gradient-to-r from-gray-200 to-gray-500 opacity-40 rounded-full animate-pulse absolute top-10 left-10" />
      </div>

      <div className="max-w-md mx-auto">
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className={`rounded-full ${
              isDarkMode
                ? "bg-slate-800 hover:bg-slate-700"
                : "bg-white hover:bg-slate-100"
            }`}
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>

        <Card
          className={`${
            isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white"
          }`}
        >
          <CardHeader>
            <CardTitle
              className={`text-center ${
                isDarkMode ? "text-white" : "text-slate-900"
              }`}
            >
              Cek Suhu Lokasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Masukkan nama kota..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className={`flex-1 ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      : "bg-white"
                  }`}
                />
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={searchLocation}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Cari
                </Button>
              </div>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                variant="default"
                onClick={getCurrentLocation}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Gunakan Lokasi Saat Ini
              </Button>

              {isLoading && (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              )}

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                  {error}
                </div>
              )}

              {weatherData && (
                <div
                  className={`rounded-lg p-4  ${
                    isDarkMode ? "bg-slate-700" : "bg-blue-50"
                  }`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3
                        className={`text-lg font-semibold ${
                          isDarkMode ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {weatherData.name}
                      </h3>
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-slate-300" : "text-slate-600"
                        }`}
                      >
                        {weatherData.weather[0].description}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleTemperatureUnit}
                      className={`${
                        isDarkMode ? "hover:bg-slate-600" : "hover:bg-blue-100"
                      }`}
                    >
                      {isCelsius ? "°C" : "°F"}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        isDarkMode ? "bg-slate-600" : "bg-white"
                      }`}
                    >
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-slate-300" : "text-slate-600"
                        }`}
                      >
                        Suhu
                      </p>
                      <p
                        className={`text-2xl font-bold ${
                          isDarkMode ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {convertTemperature(weatherData.main.temp)}°
                        {isCelsius ? "C" : "F"}
                      </p>
                    </div>
                    <div
                      className={`p-3 rounded-lg ${
                        isDarkMode ? "bg-slate-600" : "bg-white"
                      }`}
                    >
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-slate-300" : "text-slate-600"
                        }`}
                      >
                        Kelembaban
                      </p>
                      <p
                        className={`text-2xl font-bold ${
                          isDarkMode ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {weatherData.main.humidity}%
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-center mt-10">
                    <ReactAnimatedWeather
                      icon={getWeatherIcon(weatherData.weather[0].main)} // Menggunakan konversi ikon
                      color={isDarkMode ? "white" : "black"} // Sesuaikan warna dengan tema
                      animate={true}
                      size={100} // Ukuran animasi
                      className=""
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WeatherApp;
