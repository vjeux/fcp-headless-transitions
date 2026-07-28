__ZN17OZStringTablesMapD0Ev:
0000000000063d50	pushq	%rbp
0000000000063d51	movq	%rsp, %rbp
0000000000063d54	pushq	%rbx
0000000000063d55	pushq	%rax
0000000000063d56	movq	%rdi, %rbx
0000000000063d59	leaq	__ZTV17OZStringTablesMap(%rip), %rax ## vtable for OZStringTablesMap
0000000000063d60	addq	$0x10, %rax
0000000000063d64	movq	%rax, (%rdi)
0000000000063d67	addq	$0x70, %rdi
0000000000063d6b	movq	0x78(%rbx), %rsi
0000000000063d6f	callq	__ZNSt3__16__treeINS_12__value_typeI8PCStringNS_6vectorIS2_NS_9allocatorIS2_EEEEEENS_19__map_value_compareIS2_NS_4pairIKS2_S6_EENS_4lessIS2_EELb1EEENS4_ISB_EEE7destroyEPNS_11__tree_nodeIS7_PvEE ## std::__1::__tree<std::__1::__value_type<PCString, std::__1::vector<PCString, std::__1::allocator<PCString>>>, std::__1::__map_value_compare<PCString, std::__1::pair<PCString const, std::__1::vector<PCString, std::__1::allocator<PCString>>>, std::__1::less<PCString>, true>, std::__1::allocator<std::__1::pair<PCString const, std::__1::vector<PCString, std::__1::allocator<PCString>>>>>::destroy(std::__1::__tree_node<std::__1::__value_type<PCString, std::__1::vector<PCString, std::__1::allocator<PCString>>>, void*>*)
0000000000063d74	leaq	0x8(%rbx), %rdi
0000000000063d78	callq	__ZN13PCSharedMutexD2Ev         ## PCSharedMutex::~PCSharedMutex()
0000000000063d7d	movq	%rbx, %rdi
0000000000063d80	callq	0xacb4c                         ## symbol stub for: __ZN11PCSingletonD2Ev
0000000000063d85	movq	%rbx, %rdi
0000000000063d88	addq	$0x8, %rsp
0000000000063d8c	popq	%rbx
0000000000063d8d	popq	%rbp
0000000000063d8e	jmp	0xace04                         ## symbol stub for: __ZdlPv
0000000000063d93	nop
