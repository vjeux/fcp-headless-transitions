__ZN8PCICCTag9push_backEh:
00000000000b6ab0	pushq	%rbp
00000000000b6ab1	movq	%rsp, %rbp
00000000000b6ab4	subq	$0x10, %rsp
00000000000b6ab8	leaq	-0x1(%rbp), %rax
00000000000b6abc	movb	%sil, (%rax)
00000000000b6abf	addq	$0x8, %rdi
00000000000b6ac3	movq	%rax, %rsi
00000000000b6ac6	callq	__ZNSt3__16vectorIhNS_9allocatorIhEEE9push_backB9nqe210106ERKh ## std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::push_back[abi:nqe210106](unsigned char const&)
00000000000b6acb	addq	$0x10, %rsp
00000000000b6acf	popq	%rbp
00000000000b6ad0	retq
00000000000b6ad1	nop
