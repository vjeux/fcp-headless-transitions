__ZN19OZMaterialLayerBase8addTokenERK9PCHash128RK19LiTextureStoreToken:
00000000004ac840	pushq	%rbp
00000000004ac841	movq	%rsp, %rbp
00000000004ac844	pushq	%rbx
00000000004ac845	subq	$0x28, %rsp
00000000004ac849	addq	$0x4a8, %rdi                    ## imm = 0x4A8
00000000004ac850	movups	(%rsi), %xmm0
00000000004ac853	movaps	%xmm0, -0x30(%rbp)
00000000004ac857	movq	0x8(%rdx), %rax
00000000004ac85b	movups	(%rdx), %xmm0
00000000004ac85e	movaps	%xmm0, -0x20(%rbp)
00000000004ac862	testq	%rax, %rax
00000000004ac865	je	0x4ac86c
00000000004ac867	lock
00000000004ac868	incq	0x8(%rax)
00000000004ac86c	leaq	-0x30(%rbp), %rdx
00000000004ac870	movq	%rdx, %rsi
00000000004ac873	callq	__ZNSt3__16__treeINS_12__value_typeI9PCHash128NS_8weak_ptrI7PCMutexEEEENS_19__map_value_compareIS2_NS_4pairIKS2_S5_EENS_4lessIS2_EELb1EEENS_9allocatorISA_EEE25__emplace_unique_key_argsIS2_JSA_EEENS8_INS_15__tree_iteratorIS6_PNS_11__tree_nodeIS6_PvEElEEbEERKT_DpOT0_ ## std::__1::pair<std::__1::__tree_iterator<std::__1::__value_type<PCHash128, std::__1::weak_ptr<PCMutex>>, std::__1::__tree_node<std::__1::__value_type<PCHash128, std::__1::weak_ptr<PCMutex>>, void*>*, long>, bool> std::__1::__tree<std::__1::__value_type<PCHash128, std::__1::weak_ptr<PCMutex>>, std::__1::__map_value_compare<PCHash128, std::__1::pair<PCHash128 const, std::__1::weak_ptr<PCMutex>>, std::__1::less<PCHash128>, true>, std::__1::allocator<std::__1::pair<PCHash128 const, std::__1::weak_ptr<PCMutex>>>>::__emplace_unique_key_args<PCHash128, std::__1::pair<PCHash128 const, std::__1::weak_ptr<PCMutex>>>(PCHash128 const&, std::__1::pair<PCHash128 const, std::__1::weak_ptr<PCMutex>>&&)
00000000004ac878	movq	-0x18(%rbp), %rbx
00000000004ac87c	testq	%rbx, %rbx
00000000004ac87f	je	0x4ac893
00000000004ac881	movq	$-0x1, %rax
00000000004ac888	lock
00000000004ac889	xaddq	%rax, 0x8(%rbx)
00000000004ac88e	testq	%rax, %rax
00000000004ac891	je	0x4ac89a
00000000004ac893	addq	$0x28, %rsp
00000000004ac897	popq	%rbx
00000000004ac898	popq	%rbp
00000000004ac899	retq
00000000004ac89a	movq	(%rbx), %rax
00000000004ac89d	movq	%rbx, %rdi
00000000004ac8a0	callq	*0x10(%rax)
00000000004ac8a3	movq	%rbx, %rdi
00000000004ac8a6	callq	0x6dfbbe                        ## symbol stub for: __ZNSt3__119__shared_weak_count14__release_weakEv
00000000004ac8ab	addq	$0x28, %rsp
00000000004ac8af	popq	%rbx
00000000004ac8b0	popq	%rbp
00000000004ac8b1	retq
00000000004ac8b2	movq	%rax, %rbx
00000000004ac8b5	leaq	-0x30(%rbp), %rdi
00000000004ac8b9	callq	__ZNSt3__14pairIK9PCHash12819LiTextureStoreTokenED1Ev ## std::__1::pair<PCHash128 const, LiTextureStoreToken>::~pair()
00000000004ac8be	movq	%rbx, %rdi
00000000004ac8c1	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000004ac8c6	nopw	%cs:(%rax,%rax)
