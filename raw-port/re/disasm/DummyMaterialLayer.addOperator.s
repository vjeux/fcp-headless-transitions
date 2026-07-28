__ZN18DummyMaterialLayer11addOperatorERK5PCPtrI23LiMaterialLayerOperatorE:
00000000001e1dc0	pushq	%rbp
00000000001e1dc1	movq	%rsp, %rbp
00000000001e1dc4	pushq	%r14
00000000001e1dc6	pushq	%rbx
00000000001e1dc7	movq	%rdi, %rbx
00000000001e1dca	movq	0x28(%rdi), %r14
00000000001e1dce	cmpq	0x30(%rdi), %r14
00000000001e1dd2	jae	0x1e1df1
00000000001e1dd4	movq	(%rsi), %rax
00000000001e1dd7	movq	%rax, (%r14)
00000000001e1dda	leaq	0x8(%r14), %rdi
00000000001e1dde	addq	$0x8, %rsi
00000000001e1de2	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
00000000001e1de7	addq	$0x10, %r14
00000000001e1deb	movq	%r14, 0x28(%rbx)
00000000001e1def	jmp	0x1e1dfd
00000000001e1df1	leaq	0x20(%rbx), %rdi
00000000001e1df5	callq	__ZNSt3__16vectorI5PCPtrI23LiMaterialLayerOperatorENS_9allocatorIS3_EEE24__emplace_back_slow_pathIJRKS3_EEEPS3_DpOT_ ## PCPtr<LiMaterialLayerOperator>* std::__1::vector<PCPtr<LiMaterialLayerOperator>, std::__1::allocator<PCPtr<LiMaterialLayerOperator>>>::__emplace_back_slow_path<PCPtr<LiMaterialLayerOperator> const&>(PCPtr<LiMaterialLayerOperator> const&)
00000000001e1dfa	movq	%rax, %r14
00000000001e1dfd	movq	%r14, 0x28(%rbx)
00000000001e1e01	popq	%rbx
00000000001e1e02	popq	%r14
00000000001e1e04	popq	%rbp
00000000001e1e05	retq
00000000001e1e06	movq	%r14, 0x28(%rbx)
00000000001e1e0a	movq	%rax, %rdi
00000000001e1e0d	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000001e1e12	nopw	%cs:(%rax,%rax)
