__ZN8PCICCTag6resizeEm:
00000000000b6a56	pushq	%rbp
00000000000b6a57	movq	%rsp, %rbp
00000000000b6a5a	movq	0x8(%rdi), %rcx
00000000000b6a5e	movq	0x10(%rdi), %rdx
00000000000b6a62	subq	%rcx, %rdx
00000000000b6a65	movq	%rsi, %rax
00000000000b6a68	subq	%rdx, %rax
00000000000b6a6b	jbe	0xb6a7a
00000000000b6a6d	addq	$0x8, %rdi
00000000000b6a71	movq	%rax, %rsi
00000000000b6a74	popq	%rbp
00000000000b6a75	jmp	__ZNSt3__16vectorIhNS_9allocatorIhEEE8__appendEm ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::__append(unsigned long)
00000000000b6a7a	jae	0xb6a83
00000000000b6a7c	addq	%rsi, %rcx
00000000000b6a7f	movq	%rcx, 0x10(%rdi)
00000000000b6a83	popq	%rbp
00000000000b6a84	retq
00000000000b6a85	nop
