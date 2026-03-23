cmake_minimum_required(VERSION 3.10)
project(LabRecursion)

set(CMAKE_CXX_STANDARD 17)

# Для Emscripten
if(EMSCRIPTEN)
    set(CMAKE_EXECUTABLE_SUFFIX ".html")
endif()

add_executable(lab_recursion src/main.cpp)

if(EMSCRIPTEN)
    target_link_options(lab_recursion PRIVATE
        -s WASM=1
        -s EXPORTED_FUNCTIONS="['_f11_rec','_f11_iter','_f6_rec','_f6_iter','_getCallCount','_resetCallCount','_computeAverage']"
        -s EXPORTED_RUNTIME_METHODS="['ccall','cwrap']"
        -s ALLOW_MEMORY_GROWTH=1
        -s MODULARIZE=1
        -s EXPORT_NAME='createModule'
    )
    # Копируем web файлы в папку сборки
    file(COPY ${CMAKE_SOURCE_DIR}/web/ DESTINATION ${CMAKE_CURRENT_BINARY_DIR})
endif()