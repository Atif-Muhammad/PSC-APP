// import React, { useState, useEffect } from 'react';
// import {
//     SafeAreaView,
//     StyleSheet,
//     Text,
//     View,
//     StatusBar,
//     ScrollView,
//     ImageBackground,
//     Image,
//     TouchableOpacity,
//     ActivityIndicator,
//     Alert
// } from 'react-native';
// import Swiper from 'react-native-swiper';
// import Icon from 'react-native-vector-icons/AntDesign';
// import { getMessingSubCategoriesByCategory, getMessingItemsBySubCategory } from '../config/apis';

// const MessingCategoryDetails = ({ route, navigation }) => {
//     const { categoryId, categoryName, categoryImage } = route.params;

//     const [subCategories, setSubCategories] = useState([]);
//     const [selectedSubCategory, setSelectedSubCategory] = useState(null);
//     const [items, setItems] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [itemsLoading, setItemsLoading] = useState(false);

//     useEffect(() => {
//         fetchSubCategories();
//     }, [categoryId]);

//     useEffect(() => {
//         if (selectedSubCategory) {
//             fetchItems(selectedSubCategory.id);
//         }
//     }, [selectedSubCategory]);

//     const fetchSubCategories = async () => {
//         setLoading(true);
//         try {
//             const data = await getMessingSubCategoriesByCategory(categoryId);
//             setSubCategories(data);
//             if (data.length > 0) {
//                 setSelectedSubCategory(data[0]);
//             }
//         } catch (error) {
//             Alert.alert('Error', 'Failed to fetch sub-categories');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchItems = async (subCatId) => {
//         setItemsLoading(true);
//         try {
//             const data = await getMessingItemsBySubCategory(subCatId);
//             setItems(data);
//         } catch (error) {
//             Alert.alert('Error', 'Failed to fetch items');
//         } finally {
//             setItemsLoading(false);
//         }
//     };

//     const getImagesArray = (input) => {
//         if (!input) return [];
//         if (Array.isArray(input)) return input;
//         try {
//             const parsed = JSON.parse(input);
//             return Array.isArray(parsed) ? parsed : [];
//         } catch (e) {
//             return [];
//         }
//     };

//     const imagesArray = getImagesArray(categoryImage);

//     return (
//         <SafeAreaView style={styles.container}>
//             <StatusBar barStyle="light-content" />

//             {/* 🔹 Notch Header */}
//             <ImageBackground
//                 source={require('../assets/notch.jpg')}
//                 style={styles.notch}
//                 imageStyle={styles.notchImage}
//             >
//                 <View style={styles.notchContent}>
//                     <TouchableOpacity
//                         style={styles.backButton}
//                         onPress={() => navigation.goBack()}
//                     >
//                         <Icon name="arrowleft" size={28} color="black" />
//                     </TouchableOpacity>
//                     <Text style={styles.headerTitle}>{categoryName || 'Details'}</Text>
//                     <View style={{ width: 40 }} />
//                 </View>
//             </ImageBackground>

//             {/* Loading State */}
//             {loading ? (
//                 <View style={styles.loadingContainer}>
//                     <ActivityIndicator size="large" color="#A3834C" />
//                 </View>
//             ) : (
//                 <>
//                     {/* Slider / Top Image */}
//                     <View style={styles.sliderContainer}>
//                         {imagesArray.length > 0 ? (
//                             <Swiper autoplay autoplayTimeout={4} loop showsPagination activeDotColor="#A3834C">
//                                 {imagesArray.map((img, index) => {
//                                     const uri = typeof img === 'string' ? img : img.url;
//                                     return <Image key={index} source={{ uri }} style={styles.sliderImage} />;
//                                 })}
//                             </Swiper>
//                         ) : (
//                             <Image source={require('../assets/food.jpeg')} style={styles.sliderImage} />
//                         )}
//                     </View>


//                     {/* Horizontal SubCategories */}
//                     {subCategories.length > 0 && (
//                         <View>
//                             <View style={styles.sectionHeader}>
//                                 <View style={styles.line} />
//                                 <Text style={styles.sectionTitle}>Menu</Text>
//                                 <View style={styles.line} />
//                             </View>

//                             <ScrollView
//                                 horizontal
//                                 showsHorizontalScrollIndicator={false}
//                                 contentContainerStyle={styles.horizontalScroll}
//                             >
//                                 {subCategories.map((subCat) => (
//                                     <TouchableOpacity
//                                         key={subCat.id}
//                                         style={[styles.menuButton, selectedSubCategory?.id === subCat.id && styles.menuButtonActive]}
//                                         onPress={() => setSelectedSubCategory(subCat)}
//                                     >
//                                         <Text style={[styles.menuButtonText, selectedSubCategory?.id === subCat.id && styles.menuButtonTextActive]}>
//                                             {subCat.name.toUpperCase()}
//                                         </Text>
//                                     </TouchableOpacity>
//                                 ))}
//                             </ScrollView>
//                             <Text style={styles.categoryTitle}>
//                                 {selectedSubCategory?.name.toUpperCase()}
//                             </Text>
//                         </View>
//                     )}

//                     {/* Items List */}
//                     <ScrollView style={styles.itemsScroll} contentContainerStyle={{ paddingBottom: 30 }}>
//                         {itemsLoading ? (
//                             <ActivityIndicator size="small" color="#A3834C" style={{ marginTop: 20 }} />
//                         ) : (
//                             <View style={styles.menuItemsContainer}>
//                                 {items.length > 0 ? items.map((item) => (
//                                     <View key={item.id} style={styles.menuItem}>
//                                         <View style={styles.menuItemLeft}>
//                                             <Text style={styles.menuItemName}>{item.name}</Text>
//                                             {item.description && <Text style={styles.menuItemSize}>{item.description}</Text>}
//                                         </View>
//                                         <View style={styles.menuItemRight}>
//                                             <Text style={styles.menuItemPrice}>Rs.{item.price}</Text>
//                                         </View>
//                                     </View>
//                                 )) : (
//                                     <Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>No items found in this section.</Text>
//                                 )}
//                             </View>
//                         )}

//                     </ScrollView>
//                 </>
//             )}
//         </SafeAreaView>
//     );
// };

// // ---------------------- STYLES ----------------------
// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#F5E6D3',
//     },
//     loadingContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center'
//     },
//     notch: {
//         paddingTop: 50,
//         paddingBottom: 20,
//         paddingHorizontal: 20,
//         borderBottomEndRadius: 30,
//         borderBottomStartRadius: 30,
//         overflow: 'hidden',
//         minHeight: 120,
//     },
//     notchImage: {
//         resizeMode: 'cover',
//         position: 'absolute',
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         borderBottomLeftRadius: 25,
//         borderBottomRightRadius: 25,
//     },
//     notchContent: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//     },
//     backButton: { justifyContent: 'center', alignItems: 'center' },
//     headerTitle: {
//         fontSize: 22, fontWeight: 'bold', color: '#000', flex: 1, textAlign: 'center',
//         marginLeft: 20
//     },
//     sliderContainer: {
//         height: 200,
//         width: '90%',
//         alignSelf: 'center',
//         marginTop: 12,
//         marginBottom: 10,
//         borderRadius: 15,
//         overflow: 'hidden',
//     },
//     sliderImage: {
//         width: '100%',
//         height: '100%',
//         resizeMode: 'cover',
//     },
//     sectionHeader: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         marginVertical: 14,
//         paddingHorizontal: 30,
//     },
//     line: {
//         flex: 1,
//         height: 1,
//         backgroundColor: '#000',
//     },
//     sectionTitle: {
//         fontSize: 18,
//         fontWeight: '400',
//         color: '#000',
//         marginHorizontal: 15,
//         letterSpacing: 2,
//     },

//     horizontalScroll: {
//         paddingHorizontal: 20,
//         paddingVertical: 8,
//     },
//     menuButton: {
//         backgroundColor: '#FFFFFF',
//         paddingHorizontal: 18,
//         paddingVertical: 10,
//         borderRadius: 20,
//         marginRight: 10,
//         borderWidth: 1,
//         borderColor: '#E0D4C0',
//     },
//     menuButtonActive: {
//         backgroundColor: '#A3834C',
//     },
//     menuButtonText: {
//         color: '#000',
//         fontSize: 12,
//         fontWeight: '500',
//         letterSpacing: 0.5,
//     },
//     menuButtonTextActive: {
//         color: '#FFFFFF',
//     },
//     categoryTitle: {
//         fontSize: 24,
//         fontWeight: '400',
//         color: '#000',
//         textAlign: 'center',
//         marginVertical: 18,
//         letterSpacing: 1,
//     },
//     itemsScroll: {
//         flex: 1,
//     },
//     menuItemsContainer: {
//         paddingHorizontal: 20,
//         paddingBottom: 30,
//     },
//     menuItem: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         backgroundColor: '#FFF9F0',
//         paddingVertical: 14,
//         paddingHorizontal: 16,
//         marginBottom: 12,
//         borderRadius: 12,
//     },
//     menuItemLeft: {
//         flex: 1,
//         marginRight: 15,
//     },
//     menuItemName: {
//         fontSize: 16,
//         color: '#000',
//         fontWeight: '400',
//     },
//     menuItemSize: {
//         fontSize: 14,
//         color: '#666',
//         fontWeight: '300',
//     },
//     menuItemRight: {
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     menuItemPrice: {
//         fontSize: 16,
//         fontWeight: '500',
//         color: '#000',
//         marginRight: 12,
//     },
// });

// export default MessingCategoryDetails;


import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    StatusBar,
    ScrollView,
    ImageBackground,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Alert
} from 'react-native';
import Swiper from 'react-native-swiper';
import Icon from 'react-native-vector-icons/AntDesign';
import { getMessingSubCategoriesByCategory, getMessingItemsBySubCategory } from '../config/apis';

const MessingCategoryDetails = ({ route, navigation }) => {
    const { categoryId, categoryName, categoryImage } = route.params;

    const [subCategories, setSubCategories] = useState([]);
    const [selectedSubCategory, setSelectedSubCategory] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [itemsLoading, setItemsLoading] = useState(false);

    useEffect(() => {
        fetchSubCategories();
    }, [categoryId]);

    useEffect(() => {
        if (selectedSubCategory) {
            fetchItems(selectedSubCategory.id);
        }
    }, [selectedSubCategory]);

    const fetchSubCategories = async () => {
        setLoading(true);
        try {
            const data = await getMessingSubCategoriesByCategory(categoryId);
            setSubCategories(data);
            if (data.length > 0) {
                setSelectedSubCategory(data[0]);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch sub-categories');
        } finally {
            setLoading(false);
        }
    };

    const fetchItems = async (subCatId) => {
        setItemsLoading(true);
        try {
            const data = await getMessingItemsBySubCategory(subCatId);
            setItems(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch items');
        } finally {
            setItemsLoading(false);
        }
    };

    const getImagesArray = (input) => {
        if (!input) return [];
        if (Array.isArray(input)) return input;
        try {
            const parsed = JSON.parse(input);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    };

    const imagesArray = getImagesArray(categoryImage);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* 🔹 Notch Header */}
            <ImageBackground
                source={require('../assets/notch.jpg')}
                style={styles.notch}
                imageStyle={styles.notchImage}
            >
                <View style={styles.notchContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Icon name="arrowleft" size={28} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{categoryName || 'Details'}</Text>
                    <View style={{ width: 40 }} />
                </View>
            </ImageBackground>

            {/* Loading State */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#b48a64" />
                </View>
            ) : (
                <ScrollView style={styles.itemsScroll} contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
                    {/* Slider / Top Image */}
                    <View style={styles.sliderContainer}>
                        {imagesArray.length > 0 ? (
                            <Swiper autoplay autoplayTimeout={4} loop showsPagination activeDotColor="#b48a64">
                                {imagesArray.map((img, index) => {
                                    const uri = typeof img === 'string' ? img : img.url;
                                    return <Image key={index} source={{ uri }} style={styles.sliderImage} />;
                                })}
                            </Swiper>
                        ) : (
                            <Image source={require('../assets/food.jpeg')} style={styles.sliderImage} />
                        )}
                    </View>


                    {/* Horizontal SubCategories */}
                    {subCategories.length > 0 && (
                        <View>
                            <View style={styles.sectionHeader}>
                                <View style={styles.line} />
                                <Text style={styles.sectionTitle}>Menu</Text>
                                <View style={styles.line} />
                            </View>

                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.horizontalScroll}
                            >
                                {subCategories.map((subCat) => (
                                    <TouchableOpacity
                                        key={subCat.id}
                                        style={[styles.menuButton, selectedSubCategory?.id === subCat.id && styles.menuButtonActive]}
                                        onPress={() => setSelectedSubCategory(subCat)}
                                    >
                                        <Text style={[styles.menuButtonText, selectedSubCategory?.id === subCat.id && styles.menuButtonTextActive]}>
                                            {subCat.name.toUpperCase()}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                            <Text style={styles.categoryTitle}>
                                {selectedSubCategory?.name.toUpperCase()}
                            </Text>
                        </View>
                    )}

                    {/* Items List */}
                    <View>
                        {itemsLoading ? (
                            <ActivityIndicator size="small" color="#A3834C" style={{ marginTop: 20 }} />
                        ) : (
                            <View style={styles.menuItemsContainer}>
                                {items.length > 0 ? items.map((item) => (
                                    <View key={item.id} style={styles.menuItem}>
                                        <View style={styles.menuItemLeft}>
                                            <Text style={styles.menuItemName}>{item.name}</Text>
                                            {item.description && <Text style={styles.menuItemSize}>{item.description}</Text>}
                                        </View>
                                        <View style={styles.menuItemRight}>
                                            <Text style={styles.menuItemPrice}>Rs.{item.price}</Text>
                                        </View>
                                    </View>
                                )) : (
                                    <Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>No items found in this section.</Text>
                                )}
                            </View>
                        )}

                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

// ---------------------- STYLES ----------------------
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FEF9F3',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    notch: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomEndRadius: 30,
        borderBottomStartRadius: 30,
        overflow: 'hidden',
        minHeight: 120,
    },
    notchImage: {
        resizeMode: 'cover',
    },
    notchContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: '#000',
        flex: 1,
        textAlign: 'center',
    },
    sliderContainer: {
        height: 200,
        width: '90%',
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 10,
        borderRadius: 15,
        overflow: 'hidden',
    },
    sliderImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 14,
        paddingHorizontal: 30,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#000',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '400',
        color: '#000',
        marginHorizontal: 15,
        letterSpacing: 2,
    },

    horizontalScroll: {
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    menuButton: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#E0D4C0',
    },
    menuButtonActive: {
        backgroundColor: '#b48a64',
    },
    menuButtonText: {
        color: '#000',
        fontSize: 12,
        fontWeight: '500',
        letterSpacing: 0.5,
    },
    menuButtonTextActive: {
        color: '#F9EFE6',
    },
    categoryTitle: {
        fontSize: 24,
        fontWeight: '400',
        color: '#000',
        textAlign: 'center',
        marginVertical: 18,
        letterSpacing: 1,
    },
    itemsScroll: {
        flex: 1,
    },
    menuItemsContainer: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginBottom: 12,
        borderRadius: 15,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    menuItemLeft: {
        flex: 1,
        marginRight: 15,
    },
    menuItemName: {
        fontSize: 16,
        color: '#000',
        fontWeight: '500',
    },
    menuItemSize: {
        fontSize: 14,
        color: '#666',
        fontWeight: '300',
    },
    menuItemRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuItemPrice: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
        marginRight: 12,
    },
});

export default MessingCategoryDetails;