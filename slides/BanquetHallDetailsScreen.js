// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   Image,
//   StyleSheet,
//   StatusBar,
//   SafeAreaView,
//   TouchableOpacity,
//   ImageBackground,
//   ActivityIndicator,
// } from "react-native";
// import Swiper from "react-native-swiper";
// import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
// import { getHallRule } from "../config/apis";


// // ---------------------- SCREEN ----------------------

// export default function BanquetHallDetailsScreen({ navigation, route }) {
//   const { venue, venueType } = route.params || {};
//   const [rules, setRules] = useState([]);
//   const [loadingRules, setLoadingRules] = useState(true);

//   useEffect(() => {
//     fetchRules();
//   }, []);

//   const fetchRules = async () => {
//     try {
//       setLoadingRules(true);
//       const fetchedRules = await getHallRule();
//       console.log("✅ Fetched hall rules:", fetchedRules);
//       setRules(fetchedRules);
//     } catch (error) {
//       console.error("Error fetching rules:", error);
//     } finally {
//       setLoadingRules(false);
//     }
//   };

//   const handleBookNow = () => {
//     navigation.navigate("BHBooking", {
//       venue: venue,
//       venueType: venueType || 'hall',
//       selectedMenu: null
//     });
//   };

//   return (
//     <View style={{ flex: 1, backgroundColor: "#fffaf2" }}>

//       {/* ---------------- NOTCH AREA ---------------- */}
//       <ImageBackground
//         source={require("../assets/notch.jpg")}
//         style={styles.notch}
//         imageStyle={styles.notchImage}
//       >
//         <View style={styles.notchContent}>
//           <TouchableOpacity
//             style={styles.backButton}
//             onPress={() => navigation.goBack()}
//           >
//             <MaterialIcon name="arrow-left" size={28} color="#000" />
//           </TouchableOpacity>

//           <Text style={styles.headerText}>
//             {venue?.name || 'Banquet Hall'}
//           </Text>

//           <TouchableOpacity style={styles.notificationButton}>
//             <MaterialIcon name="bell-outline" size={26} color="#000" />
//           </TouchableOpacity>
//         </View>
//       </ImageBackground>

//       {/* ---------------- CONTENT ---------------- */}
//       <SafeAreaView style={{ flex: 1 }}>
//         <StatusBar barStyle="light-content" backgroundColor="black" />
//         <ScrollView showsVerticalScrollIndicator={false}>

//           {/* IMAGE SLIDER */}
//           <View style={styles.sliderContainer}>
//             {venue?.images?.length > 0 ? (
//               <Swiper autoplay autoplayTimeout={4} loop showsPagination activeDotColor="#A3834C">
//                 {venue.images.map((img, index) => (
//                   <Image
//                     key={index}
//                     source={{ uri: img.url }}
//                     style={styles.sliderImage}
//                   />
//                 ))}
//               </Swiper>
//             ) : (
//               <Swiper autoplay autoplayTimeout={4} loop showsPagination activeDotColor="#A3834C">
//                 <Image source={require("../assets/1.jpeg")} style={styles.sliderImage} />
//                 <Image source={require("../assets/2.jpeg")} style={styles.sliderImage} />
//               </Swiper>
//             )}
//           </View>

//           <Text style={styles.sectionHeading}>
//             MORE ABOUT <Text style={{ color: "#A3834C" }}>{venue?.name}</Text>
//           </Text>

//           {/* ABOUT */}
//           <View style={styles.card}>
//             <Text style={styles.detailTitle}>About {venue?.name}</Text>
//             <Text style={styles.detailText}>
//               {venue?.description ||
//                 'Experience the pinnacle of luxury and elegance at our prestigious hall.'}
//             </Text>

//             <View style={styles.capacityBadge}>
//               <MaterialIcon name="account-group" size={20} color="#A3834C" />
//               <Text style={styles.capacityText}>
//                 Capacity: {venue?.capacity || 'N/A'} Guests
//               </Text>
//             </View>
//           </View>

//           {/* BOOKING TYPE & PRICING */}
//           <View style={styles.card}>
//             <Text style={styles.detailTitle}>Booking Type & Pricing</Text>

//             <View style={styles.priceContainer}>
//               <View style={styles.priceItem}>
//                 <View style={styles.priceIconBg}>
//                   <MaterialIcon name="account" size={26} color="#A3834C" />
//                 </View>
//                 <Text style={styles.priceType}>Member Booking</Text>
//                 <Text style={styles.priceValue}>
//                   Rs. {venue?.chargesMembers?.toLocaleString() || 'N/A'}
//                 </Text>
//               </View>

//               <View style={styles.priceItem}>
//                 <View style={styles.priceIconBg}>
//                   <MaterialIcon name="account-outline" size={26} color="#A3834C" />
//                 </View>
//                 <Text style={styles.priceType}>Guest Booking</Text>
//                 <Text style={styles.priceValue}>
//                   Rs. {venue?.chargesGuests?.toLocaleString() || 'N/A'}
//                 </Text>
//               </View>
//             </View>
//           </View>

//           {/* RULES SECTION */}
//           <View style={styles.card}>
//             <Text style={styles.detailTitle}>Hall Rules & Policy</Text>
//             {loadingRules ? (
//               <ActivityIndicator color="#A3834C" size="small" />
//             ) : rules && rules.length > 0 ? (
//               rules.map((rule, index) => (
//                 <View key={rule.id || index} style={styles.ruleItem}>
//                   <MaterialIcon name="check-circle-outline" size={18} color="#A3834C" />
//                   <Text style={styles.ruleText}>{rule.content || rule.rule}</Text>
//                 </View>
//               ))
//             ) : (
//               <Text style={styles.noRulesText}>No rules found for this hall.</Text>
//             )}
//           </View>


//         </ScrollView>

//         {/* BOOK NOW BUTTON */}
//         <View style={styles.bookNowContainer}>
//           <TouchableOpacity style={styles.bookNowButton} onPress={handleBookNow}>
//             <Text style={styles.bookNowText}>Book Now</Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     </View>
//   );
// }

// // ---------------------- STYLES ----------------------

// const styles = StyleSheet.create({
//   notch: {
//     paddingTop: 50,
//     paddingBottom: 20,
//     paddingHorizontal: 20,
//     borderBottomEndRadius: 30,
//     borderBottomStartRadius: 30,
//     overflow: "hidden",
//   },

//   notchImage: { resizeMode: "cover" },

//   notchContent: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },

//   backButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },

//   headerText: {
//     fontSize: 22,
//     fontWeight: "bold",
//     color: "#000",
//     flex: 1,
//     textAlign: "center",
//   },

//   notificationButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },

//   sliderContainer: {
//     width: "92%",
//     height: 200,
//     alignSelf: "center",
//     borderRadius: 20,
//     overflow: "hidden",
//     marginTop: 15,
//   },

//   sliderImage: {
//     width: "100%",
//     height: "100%",
//     resizeMode: "cover",
//   },

//   sectionHeading: {
//     textAlign: "center",
//     fontSize: 18,
//     fontWeight: "bold",
//     marginVertical: 15,
//   },

//   card: {
//     backgroundColor: "#fff",
//     marginHorizontal: 15,
//     marginBottom: 15,
//     padding: 20,
//     borderRadius: 15,
//     elevation: 4,
//   },

//   detailTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#A3834C",
//     marginBottom: 10,
//   },

//   detailText: {
//     fontSize: 14,
//     color: "#555",
//     lineHeight: 22,
//     marginBottom: 15,
//   },

//   capacityBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fffaf2",
//     paddingHorizontal: 15,
//     paddingVertical: 10,
//     borderRadius: 10,
//   },

//   capacityText: {
//     marginLeft: 8,
//     fontWeight: "600",
//     color: "#A3834C",
//   },

//   priceContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },

//   priceItem: {
//     width: "48%",
//     alignItems: "center",
//     backgroundColor: "#fffaf2",
//     borderRadius: 12,
//     padding: 15,
//     borderWidth: 1,
//     borderColor: "#e0d1b8",
//   },

//   priceIconBg: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: "#fff",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: "#e0d1b8",
//   },

//   priceType: {
//     fontSize: 13,
//     color: "#666",
//     marginBottom: 4,
//   },

//   priceValue: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#333",
//   },

//   ruleItem: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     marginBottom: 8,
//     paddingRight: 10,
//   },

//   ruleText: {
//     fontSize: 14,
//     color: "#555",
//     marginLeft: 8,
//     lineHeight: 20,
//     flex: 1,
//   },

//   noRulesText: {
//     fontSize: 14,
//     color: "#999",
//     fontStyle: "italic",
//     textAlign: "center",
//   },

//   bookNowContainer: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     padding: 15,
//     backgroundColor: "#fff",
//   },

//   bookNowButton: {
//     backgroundColor: "#a0855c",
//     paddingVertical: 15,
//     borderRadius: 15,
//     alignItems: "center",
//   },

//   bookNowText: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#fff",
//   },
// });

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import Swiper from "react-native-swiper";
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getHallRule } from "../config/apis";


// ---------------------- SCREEN ----------------------

export default function BanquetHallDetailsScreen({ navigation, route }) {
  const { venue, venueType } = route.params || {};
  const [rules, setRules] = useState([]);
  const [loadingRules, setLoadingRules] = useState(true);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoadingRules(true);
      const fetchedRules = await getHallRule();
      console.log("✅ Fetched hall rules:", fetchedRules);
      setRules(fetchedRules);
    } catch (error) {
      console.error("Error fetching rules:", error);
    } finally {
      setLoadingRules(false);
    }
  };

  const handleBookNow = () => {
    navigation.navigate("BHBooking", {
      venue: venue,
      venueType: venueType || 'hall',
      selectedMenu: null
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fffaf2" }}>

      {/* ---------------- NOTCH AREA ---------------- */}
      <ImageBackground
        source={require("../assets/notch.jpg")}
        style={styles.notch}
        imageStyle={styles.notchImage}
      >
        <View style={styles.notchContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcon name="arrow-left" size={28} color="#000" />
          </TouchableOpacity>

          <Text style={styles.headerText}>
            {venue?.name || 'Banquet Hall'}
          </Text>

          <TouchableOpacity style={styles.notificationButton}>
            <MaterialIcon name="bell-outline" size={26} color="#000" />
          </TouchableOpacity>
        </View>
      </ImageBackground>

      {/* ---------------- CONTENT ---------------- */}
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" backgroundColor="black" />
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* IMAGE SLIDER */}
          <View style={styles.sliderContainer}>
            {venue?.images?.length > 0 ? (
              <Swiper autoplay autoplayTimeout={4} loop showsPagination activeDotColor="#A3834C">
                {venue.images.map((img, index) => (
                  <Image
                    key={index}
                    source={{ uri: img.url }}
                    style={styles.sliderImage}
                  />
                ))}
              </Swiper>
            ) : (
              <Swiper autoplay autoplayTimeout={4} loop showsPagination activeDotColor="#A3834C">
                <Image source={require("../assets/1.jpeg")} style={styles.sliderImage} />
                <Image source={require("../assets/2.jpeg")} style={styles.sliderImage} />
              </Swiper>
            )}
          </View>

          <Text style={styles.sectionHeading}>
            MORE ABOUT <Text style={{ color: "#A3834C" }}>{venue?.name}</Text>
          </Text>

          {/* ABOUT */}
          <View style={styles.card}>
            <Text style={styles.detailTitle}>About {venue?.name}</Text>
            <Text style={styles.detailText}>
              {venue?.description ||
                'Experience the pinnacle of luxury and elegance at our prestigious hall.'}
            </Text>

            <View style={styles.capacityBadge}>
              <MaterialIcon name="account-group" size={20} color="#A3834C" />
              <Text style={styles.capacityText}>
                Capacity: {venue?.capacity || 'N/A'} Guests
              </Text>
            </View>
          </View>

          {/* BOOKING TYPE & PRICING */}
          <View style={styles.card}>
            <Text style={styles.detailTitle}>Booking Type & Pricing</Text>

            <View style={styles.priceContainer}>
              <View style={styles.priceItem}>
                <View style={styles.priceIconBg}>
                  <MaterialIcon name="account" size={26} color="#A3834C" />
                </View>
                <Text style={styles.priceType}>Member Booking</Text>
                <Text style={styles.priceValue}>
                  Rs. {venue?.chargesMembers?.toLocaleString() || 'N/A'}
                </Text>
              </View>

              <View style={styles.priceItem}>
                <View style={styles.priceIconBg}>
                  <MaterialIcon name="account-outline" size={26} color="#A3834C" />
                </View>
                <Text style={styles.priceType}>Guest Booking</Text>
                <Text style={styles.priceValue}>
                  Rs. {venue?.chargesGuests?.toLocaleString() || 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          {/* RULES SECTION */}
          <View style={styles.card}>
            <Text style={styles.detailTitle}>Hall Rules & Policy</Text>
            {loadingRules ? (
              <ActivityIndicator color="#A3834C" size="small" />
            ) : rules && rules.length > 0 ? (
              rules.map((rule, index) => (
                <View key={rule.id || index} style={styles.ruleItem}>
                  <MaterialIcon name="check-circle-outline" size={18} color="#A3834C" />
                  <Text style={styles.ruleText}>{rule.content || rule.rule}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noRulesText}>No rules found for this hall.</Text>
            )}
          </View>


        </ScrollView>

        {/* BOOK NOW BUTTON */}
        <View style={styles.bookNowContainer}>
          <TouchableOpacity style={styles.bookNowButton} onPress={handleBookNow}>
            <Text style={styles.bookNowText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

// ---------------------- STYLES ----------------------

const styles = StyleSheet.create({
  notch: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomEndRadius: 30,
    borderBottomStartRadius: 30,
    overflow: "hidden",
  },

  notchImage: { resizeMode: "cover" },

  notchContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  backButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },

  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    flex: 1,
    textAlign: "center",
  },

  notificationButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },

  sliderContainer: {
    width: "92%",
    height: 200,
    alignSelf: "center",
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 15,
  },

  sliderImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  sectionHeading: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 15,
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    borderRadius: 15,
    elevation: 4,
  },

  detailTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#A3834C",
    marginBottom: 10,
  },

  detailText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
    marginBottom: 15,
  },

  capacityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffaf2",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
  },

  capacityText: {
    marginLeft: 8,
    fontWeight: "600",
    color: "#A3834C",
  },

  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  priceItem: {
    width: "48%",
    alignItems: "center",
    backgroundColor: "#fffaf2",
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: "#e0d1b8",
  },

  priceIconBg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0d1b8",
  },

  priceType: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },

  priceValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },

  ruleItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    paddingRight: 10,
  },

  ruleText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 8,
    lineHeight: 20,
    flex: 1,
  },

  noRulesText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
  },

  bookNowContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: "#fff",
  },

  bookNowButton: {
    backgroundColor: "#a0855c",
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
  },

  bookNowText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
});