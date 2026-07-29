__ZN4Json13valueToStringEb:
00000000000d1b4e	pushq	%rbp
00000000000d1b4f	movq	%rsp, %rbp
00000000000d1b52	pushq	%rbx
00000000000d1b53	pushq	%rax
00000000000d1b54	movq	%rdi, %rbx
00000000000d1b57	leaq	0x6488e(%rip), %rcx             ## literal pool for: "true"
00000000000d1b5e	leaq	0x6488c(%rip), %rax             ## literal pool for: "false"
00000000000d1b65	testl	%esi, %esi
00000000000d1b67	cmovneq	%rcx, %rax
00000000000d1b6b	movq	%rax, %rsi
00000000000d1b6e	callq	__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC2B9nqe210106ILi0EEEPKc ## std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>::basic_string[abi:nqe210106]<0>(char const*)
00000000000d1b73	movq	%rbx, %rax
00000000000d1b76	addq	$0x8, %rsp
00000000000d1b7a	popq	%rbx
00000000000d1b7b	popq	%rbp
00000000000d1b7c	retq
