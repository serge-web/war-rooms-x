// in src/Dashboard.js
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { Title } from 'react-admin';

export const Dashboard = () => (
    <Card>
        <Title title="War Rooms - Maintainer pages" />
        <CardContent>Welcome to the maintainer pages for war-rooms.</CardContent>
        <CardContent>Here is how data is organised:<br/><img src='/war-rooms-structure.png' alt='War Rooms Structure' className='max-w-full h-auto' /></CardContent>
        <CardContent>Use the links on the left to maintain each type of data.</CardContent>
    </Card>
);