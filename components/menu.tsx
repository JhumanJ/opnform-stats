"use client";

import Link from "next/link";
import { ModeToggle } from "./togglemode";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "./ui/navigation-menu";
import { Button } from "./ui/button";
import { Github, Book } from "lucide-react";

export function Menu() {

    return (
        <div className="flex flex-1 items-center justify-end">
            <NavigationMenu>
                <NavigationMenuList>
                    <NavigationMenuItem className="mr-2 hidden sm:block">
                        <Link href="https://opnform.com/forms/create/guest" target="_blank">
                            <Button className="bg-blue-500 hover:bg-blue-600 text-white" size="sm">
                                Create a form
                            </Button>
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <Link href="https://docs.opnform.com/introduction" target="_blank">
                            <Button variant="outline" size="icon">
                                <Book width={16} height={16} />
                            </Button>
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <Link href="https://github.com/opnform/opnform" target="_blank">
                            <Button variant="outline" size="icon">
                                <Github width={16} height={16} />
                            </Button>
                        </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <ModeToggle />
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    );
}
