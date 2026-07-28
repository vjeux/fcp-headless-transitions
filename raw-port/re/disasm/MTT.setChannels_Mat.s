__ZN26MaterialTextureTransformer27setTextureTransformChannelsERK6CMTimeRK14PCMatrix44TmplIdER11OZChannel2DR19OZChannelRotation3DR14OZChannelScale:
00000000004af670	pushq	%rbp
00000000004af671	movq	%rsp, %rbp
00000000004af674	pushq	%r15
00000000004af676	pushq	%r14
00000000004af678	pushq	%r12
00000000004af67a	pushq	%rbx
00000000004af67b	subq	$0x30, %rsp
00000000004af67f	movq	%r8, %rbx
00000000004af682	movq	%rcx, %r15
00000000004af685	movq	%rdx, %r12
00000000004af688	movq	%rsi, %rax
00000000004af68b	movq	%rdi, %r14
00000000004af68e	leaq	-0x48(%rbp), %rsi
00000000004af692	leaq	-0x28(%rbp), %rdx
00000000004af696	leaq	-0x38(%rbp), %rcx
00000000004af69a	movq	%rax, %rdi
00000000004af69d	callq	__ZN26MaterialTextureTransformer25decomposeTextureTransformERK14PCMatrix44TmplIdER9PCVector2IdERdS6_ ## MaterialTextureTransformer::decomposeTextureTransform(PCMatrix44Tmpl<double> const&, PCVector2<double>&, double&, PCVector2<double>&)
00000000004af6a2	movsd	-0x48(%rbp), %xmm0
00000000004af6a7	movsd	-0x40(%rbp), %xmm1
00000000004af6ac	movq	%r12, %rdi
00000000004af6af	movq	%r14, %rsi
00000000004af6b2	xorl	%edx, %edx
00000000004af6b4	callq	0x6dd566                        ## symbol stub for: __ZN11OZChannel2D8setValueERK6CMTimeddb
00000000004af6b9	movsd	-0x28(%rbp), %xmm0
00000000004af6be	movq	0x1b8(%r15), %rax
00000000004af6c5	addq	$0x1b8, %r15                    ## imm = 0x1B8
00000000004af6cc	movq	%r15, %rdi
00000000004af6cf	movq	%r14, %rsi
00000000004af6d2	xorl	%edx, %edx
00000000004af6d4	callq	*0x2c8(%rax)
00000000004af6da	movsd	-0x38(%rbp), %xmm0
00000000004af6df	movsd	-0x30(%rbp), %xmm1
00000000004af6e4	movq	%rbx, %rdi
00000000004af6e7	movq	%r14, %rsi
00000000004af6ea	xorl	%edx, %edx
00000000004af6ec	addq	$0x30, %rsp
00000000004af6f0	popq	%rbx
00000000004af6f1	popq	%r12
00000000004af6f3	popq	%r14
00000000004af6f5	popq	%r15
00000000004af6f7	popq	%rbp
00000000004af6f8	jmp	0x6dd566                        ## symbol stub for: __ZN11OZChannel2D8setValueERK6CMTimeddb
00000000004af6fd	nopl	(%rax)