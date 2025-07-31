import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Users, MessageCircle } from "lucide-react";

export default function Component() {
  const scrapers = [
    {
      name: "TikTok Scraper",
      author: "Clockworks",
      handle: "clockworks/tiktok-scraper",
      description:
        "Extract data from TikTok videos, hashtags, and users. Use URLs or search queries to scrape...",
      icon: "🎵",
      bgColor: "bg-black",
      textColor: "text-white",
      users: "52K",
      rating: "4.3",
    },
    {
      name: "Google Maps Scraper",
      author: "Compass",
      handle: "compass/crawler-google-places",
      description:
        "Extract data from thousands of Google Maps locations and businesses, including reviews,...",
      icon: "📍",
      bgColor: "bg-red-500",
      textColor: "text-white",
      users: "135K",
      rating: "4.0",
    },
    {
      name: "Instagram Scraper",
      author: "Apify",
      handle: "apify/instagram-scraper",
      description:
        "Scrape and download Instagram posts, profiles, places, hashtags, photos, and comments. Get...",
      icon: "📷",
      bgColor: "bg-gradient-to-br from-purple-500 to-pink-500",
      textColor: "text-white",
      users: "116K",
      rating: "3.9",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Your full-stack platform for web scraping
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Apify is the largest ecosystem where developers build, deploy, and
            publish web scrapers, AI agents, and automation tools. We call them
            Actors.
          </p>

          {/* Search Bar */}
          <div className="flex max-w-2xl mx-auto gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Crawl website to feed AI"
                className="h-14 pl-4 pr-4 text-lg border-gray-200 rounded-full"
              />
            </div>
            <Button
              size="lg"
              className="h-14 px-8 bg-gray-800 hover:bg-gray-900 text-white rounded-full"
            >
              Search
            </Button>
          </div>
        </div>

        {/* Scraper Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {scrapers.map((scraper, index) => (
            <Card
              key={index}
              className="border border-gray-200 hover:shadow-lg transition-shadow duration-200"
            >
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-lg ${scraper.bgColor} ${scraper.textColor} flex items-center justify-center text-lg font-semibold`}
                  >
                    {scraper.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {scraper.name}
                    </h3>
                    <p className="text-sm text-gray-500">{scraper.handle}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  {scraper.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {scraper.author.charAt(0)}
                      </span>
                    </div>
                    <span>{scraper.author}</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{scraper.users}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{scraper.rating}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Chat Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          size="lg"
          className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
