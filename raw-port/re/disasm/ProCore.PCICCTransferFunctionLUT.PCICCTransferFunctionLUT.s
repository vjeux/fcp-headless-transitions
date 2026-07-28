__ZN24PCICCTransferFunctionLUTC1EPKfS1_:
0000000000013894	pushq	%rbp
0000000000013895	movq	%rsp, %rbp
0000000000013898	leaq	0x135529(%rip), %rax
000000000001389f	movq	%rax, (%rdi)
00000000000138a2	leaq	0x8(%rdi), %rax
00000000000138a6	movq	%rdx, %rcx
00000000000138a9	subq	%rsi, %rcx
00000000000138ac	sarq	$0x2, %rcx
00000000000138b0	xorps	%xmm0, %xmm0
00000000000138b3	movups	%xmm0, 0x8(%rdi)
00000000000138b7	movq	$0x0, 0x18(%rdi)
00000000000138bf	movq	%rax, %rdi
00000000000138c2	popq	%rbp
00000000000138c3	jmp	__ZNSt3__16vectorIfNS_9allocatorIfEEE16__init_with_sizeB9nqe210106IPKfS6_EEvT_T0_m ## void std::__1::vector<float, std::__1::allocator<float>>::__init_with_size[abi:nqe210106]<float const*, float const*>(float const*, float const*, unsigned long)
