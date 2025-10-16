import React from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { CATEGORIES } from '../../constants/categories';

interface FloatingSearchBarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onSearch: () => void;
    onRoutePress: () => void;
    selectedCategory: string;
    onCategorySelect: (category: string) => void;
    isLoading?: boolean;
    isSearchFocused?: boolean;
    onSearchFocus?: () => void;
    onSearchBlur?: () => void;
    autocompleteSuggestions?: string[];
    onSuggestionSelect?: (suggestion: string) => void;
    showAutocomplete?: boolean;
}

const FloatingSearchBar: React.FC<FloatingSearchBarProps> = ({
                                                                 searchQuery,
                                                                 setSearchQuery,
                                                                 onSearch,
                                                                 onRoutePress,
                                                                 selectedCategory,
                                                                 onCategorySelect,
                                                                 isLoading,
                                                                 isSearchFocused = false,
                                                                 onSearchFocus,
                                                                 onSearchBlur,
                                                                 autocompleteSuggestions = [],
                                                                 onSuggestionSelect,
                                                                 showAutocomplete = false,
                                                             }) => {
    return (
        <View style={styles.container}>
            {/* 검색 입력 필드와 길찾기 버튼 */}
            <View style={styles.searchContainer}>
                <View style={[
                    styles.searchInputContainer,
                    isSearchFocused && styles.searchInputContainerExpanded
                ]}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="민생회복 소비쿠폰 사용처 검색하기"
                        placeholderTextColor={COLORS.textLight}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={onSearch}
                        returnKeyType="search"
                        onFocus={onSearchFocus}
                        onBlur={onSearchBlur}
                    />
                </View>

                {!isSearchFocused && (
                    <TouchableOpacity style={styles.routeButton} onPress={onRoutePress}>
                        <Ionicons name="navigate" size={16} color={COLORS.white} />
                        <Text style={styles.routeButtonText}>길찾기</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* 자동완성 드롭다운 */}
            {showAutocomplete && autocompleteSuggestions.length > 0 && (
                <View style={styles.autocompleteDropdown}>
                    <ScrollView
                        style={styles.autocompleteScrollView}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {autocompleteSuggestions.map((suggestion, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.autocompleteItem}
                                onPress={() => {
                                    if (onSuggestionSelect) {
                                        onSuggestionSelect(suggestion);
                                    }
                                }}
                            >
                                <Ionicons name="location-outline" size={16} color={COLORS.primary} />
                                <Text style={styles.autocompleteText}>{suggestion}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* 카테고리 버튼들 - 포커스 시 숨김 */}
            {!isSearchFocused && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoriesContainer}
                    contentContainerStyle={styles.categoriesContent}
                >
                    {CATEGORIES.map((category) => (
                        <View key={category.id} style={styles.categoryButtonWrapper}>
                            <TouchableOpacity
                                style={[
                                    styles.categoryButton,
                                    selectedCategory === category.id && styles.categoryButtonSelected
                                ]}
                                onPress={() => {
                                    onCategorySelect(category.id);
                                }}
                            >
                                <Ionicons
                                    name={category.icon as any}
                                    size={16}
                                    color={selectedCategory === category.id ? COLORS.primary : COLORS.textSecondary}
                                />
                                <Text style={[
                                    styles.categoryButtonText,
                                    selectedCategory === category.id && styles.categoryButtonTextSelected
                                ]}>
                                    {category.name}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 70 : 50,
        left: 20,
        right: 20,
        zIndex: 1000,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 13,
        marginRight: 12,
        ...Platform.select({
            ios: {
                shadowColor: COLORS.shadow,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    searchInputContainerExpanded: {
        marginRight: 0, // 포커스 시 길찾기 버튼 영역까지 확장
    },
    autocompleteDropdown: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        marginTop: 0, // 검색바와 가까운 거리
        marginHorizontal: 0,
        maxHeight: 150, // 높이 제한
        ...Platform.select({
            ios: {
                shadowColor: COLORS.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    autocompleteScrollView: {
        maxHeight: 150, // 스크롤뷰 높이 제한
    },
    autocompleteItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    autocompleteText: {
        fontSize: 14,
        color: COLORS.textPrimary,
        marginLeft: 12,
        flex: 1,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: COLORS.textPrimary,
        paddingVertical: 0,
    },
    searchIcon: {
        padding: 4,
    },
    routeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 13,
        ...Platform.select({
            ios: {
                shadowColor: COLORS.shadow,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.35,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    routeButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 6,
    },
    categoriesContainer: {
        marginTop: 0,
    },
    categoriesContent: {
        paddingRight: 0,
    },
    categoryButtonWrapper: {
        marginRight: 8,
        ...Platform.select({
            ios: {
                shadowColor: COLORS.shadow,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.25,
                shadowRadius: 6,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    categoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    categoryButtonSelected: {
        backgroundColor: COLORS.primaryLight,
        borderColor: COLORS.primary,
    },
    categoryButtonText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginLeft: 6,
        fontWeight: '500',
    },
    categoryButtonTextSelected: {
        color: COLORS.primary,
        fontWeight: '600',
    },
});

export default FloatingSearchBar;