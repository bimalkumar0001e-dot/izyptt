import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Heart, Phone, FileText, BarChart, Gift, Users, Calendar } from 'lucide-react';
import FeedBannerCarousel from '@/components/feedBannerCarousel';

const motivationalBanners = [
	{
		id: 1,
		image: '/lovable-uploads/064fa993-7254-478b-bd86-7fd6637f567e.png',
		title: 'Feeding Hope, One Meal at a Time',
		description: "Join us in making a difference in someone's life",
		backgroundColor: 'bg-gradient-to-r from-pink-400 to-pink-600',
	},
	{
		id: 2,
		image: '/placeholder.svg',
		title: 'Share Joy on Your Special Day',
		description: 'Celebrate your birthday by feeding those in need',
		backgroundColor: 'bg-gradient-to-r from-blue-400 to-blue-600',
	},
	{
		id: 3,
		image: '/placeholder.svg',
		title: 'Your Kindness Creates Smiles',
		description: 'Every donation brings happiness to families',
		backgroundColor: 'bg-gradient-to-r from-green-400 to-green-600',
	},
	{
		id: 4,
		image: '/placeholder.svg',
		title: 'Together We Can End Hunger',
		description: 'Be part of our mission to feed everyone',
		backgroundColor: 'bg-gradient-to-r from-yellow-400 to-orange-500',
	},
];

const FeedPeople: React.FC = () => {
	const navigate = useNavigate();

	return (
		<div className="app-container">
			<AppHeader title="Feed People" showBackButton />
			<div className="flex-1 pb-20">
				{/* Hero Section */}
				<div className="p-4 bg-gradient-to-r from-pink-400 to-pink-600 text-white">
					<div className="text-center">
						<Heart className="w-12 h-12 mx-auto mb-2" />
						<h1 className="text-2xl font-bold mb-2">Feed People</h1>
						<p className="text-sm opacity-90">
							Make your special occasions meaningful by sharing food with those in need
						</p>
					</div>
				</div>

				{/* Motivational Banner Carousel */}
				<div className="px-4 py-6">
					<h2 className="text-lg font-semibold mb-4">Our Impact Stories</h2>
					<FeedBannerCarousel banners={motivationalBanners} />
				</div>

				{/* Quick Actions */}
				<div className="px-4 mb-6">
					<div className="grid grid-cols-2 gap-4">
						<Button
							className="h-20 flex flex-col items-center justify-center bg-pink-500 hover:bg-pink-600 opacity-60 cursor-not-allowed"
							// onClick={() => navigate('/feed-people/book')}
							disabled
						>
							<Gift className="w-6 h-6 mb-1" />
							<span className="text-sm">Book Feed People</span>
						</Button>
						<Button
							variant="outline"
							className="h-20 flex flex-col items-center justify-center border-pink-300 text-pink-600 hover:bg-pink-50 opacity-60 cursor-not-allowed"
							// onClick={() => navigate('/feed-people/track')}
							disabled
						>
							<BarChart className="w-6 h-6 mb-1" />
							<span className="text-sm">Track Distribution</span>
						</Button>
					</div>
				</div>

				<Separator className="mx-4 mb-6" />

				{/* Services Section */}
				<div className="px-4 space-y-4">
					<h2 className="text-lg font-semibold">Our Services</h2>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Calendar className="w-5 h-5 text-pink-500" />
								Special Occasion Feeding
							</CardTitle>
							<CardDescription>
								Celebrate your birthday, anniversary, or any special day by feeding people in need
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-gray-600 mb-3">
								We'll print your name and occasion wishes on the packaging so recipients know who's sharing
								this kindness.
							</p>
							<Button className="bg-pink-500 hover:bg-pink-600">Book Now</Button>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Users className="w-5 h-5 text-pink-500" />
								Community Impact
							</CardTitle>
							<CardDescription>
								See the real impact of your donations with live tracking and reports
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 gap-4 text-center">
								<div>
									<div className="text-2xl font-bold text-pink-500">500+</div>
									<div className="text-xs text-gray-500">People Fed This Month</div>
								</div>
								<div>
									<div className="text-2xl font-bold text-pink-400">50+</div>
									<div className="text-xs text-gray-500">Active Donors</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Contact Section */}
				<div className="px-4 mt-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Phone className="w-5 h-5 text-pink-500" />
								Get In Touch
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<Button
								variant="outline"
								className="w-full justify-start border-pink-200 text-pink-600 hover:bg-pink-50"
							>
								<Phone className="w-4 h-4 mr-2" />
								Call Us: +91 98765 43210
							</Button>
							<Button
								variant="outline"
								className="w-full justify-start border-pink-200 text-pink-600 hover:bg-pink-50"
							>
								<FileText className="w-4 h-4 mr-2" />
								View Distribution Reports
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
			<BottomNav />
		</div>
	);
};

export default FeedPeople;
