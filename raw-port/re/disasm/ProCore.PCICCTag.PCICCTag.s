__ZN8PCICCTagC1EjPKhS1_:
00000000000b69ce	pushq	%rbp
00000000000b69cf	movq	%rsp, %rbp
00000000000b69d2	movq	%rdx, %rax
00000000000b69d5	movl	%esi, (%rdi)
00000000000b69d7	leaq	0x8(%rdi), %rsi
00000000000b69db	movq	%rcx, %r8
00000000000b69de	subq	%rdx, %r8
00000000000b69e1	xorps	%xmm0, %xmm0
00000000000b69e4	movups	%xmm0, 0x8(%rdi)
00000000000b69e8	movq	$0x0, 0x18(%rdi)
00000000000b69f0	movq	%rcx, %rdx
00000000000b69f3	movq	%rsi, %rdi
00000000000b69f6	movq	%rax, %rsi
00000000000b69f9	movq	%r8, %rcx
00000000000b69fc	popq	%rbp
00000000000b69fd	jmp	__ZNSt3__16vectorIhNS_9allocatorIhEEE16__init_with_sizeB9nqe210106IPKhS6_EEvT_T0_m ## void std::__1::vector<unsigned char, std::__1::allocator<unsigned char>>::__init_with_size[abi:nqe210106]<unsigned char const*, unsigned char const*>(unsigned char const*, unsigned char const*, unsigned long)
