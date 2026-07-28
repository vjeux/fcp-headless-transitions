__ZN23OZImageElementFinalizerD1Ev:
00000000000da4c0	pushq	%rbp
00000000000da4c1	movq	%rsp, %rbp
00000000000da4c4	pushq	%r14
00000000000da4c6	pushq	%rbx
00000000000da4c7	callq	__ZN37HGLazyResIndependentBitmapLoaderCache8InstanceEv ## HGLazyResIndependentBitmapLoaderCache::Instance()
00000000000da4cc	movq	%rax, %rbx
00000000000da4cf	movq	%rax, %r14
00000000000da4d2	addq	$0x8, %r14
00000000000da4d6	movq	0x8(%rax), %rsi
00000000000da4da	movq	%rax, %rdi
00000000000da4dd	callq	__ZNSt3__16__treeINS_12__value_typeI9PCHash1285HGRefI6HGNodeEEENS_19__map_value_compareIS2_NS_4pairIKS2_S5_EENS_4lessIS2_EELb1EEENS_9allocatorISA_EEE7destroyEPNS_11__tree_nodeIS6_PvEE ## std::__1::__tree<std::__1::__value_type<PCHash128, HGRef<HGNode>>, std::__1::__map_value_compare<PCHash128, std::__1::pair<PCHash128 const, HGRef<HGNode>>, std::__1::less<PCHash128>, true>, std::__1::allocator<std::__1::pair<PCHash128 const, HGRef<HGNode>>>>::destroy(std::__1::__tree_node<std::__1::__value_type<PCHash128, HGRef<HGNode>>, void*>*)
00000000000da4e2	movq	%r14, (%rbx)
00000000000da4e5	xorps	%xmm0, %xmm0
00000000000da4e8	movups	%xmm0, 0x8(%rbx)
00000000000da4ec	popq	%rbx
00000000000da4ed	popq	%r14
00000000000da4ef	popq	%rbp
00000000000da4f0	retq
00000000000da4f1	movq	%rax, %rdi
00000000000da4f4	callq	___clang_call_terminate
00000000000da4f9	nopl	(%rax)
