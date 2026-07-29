__ZN18OZSceneArrangement18moveElementToPlaneERKNS_7ElementERK9PCVector4IdE:
00000000005055c0	pushq	%rbp
00000000005055c1	movq	%rsp, %rbp
00000000005055c4	pushq	%r14
00000000005055c6	pushq	%rbx
00000000005055c7	subq	$0x20, %rsp
00000000005055cb	movq	%rsi, %r14
00000000005055ce	movq	%rdi, %rbx
00000000005055d1	xorps	%xmm0, %xmm0
00000000005055d4	movaps	%xmm0, -0x30(%rbp)
00000000005055d8	movq	$0x0, -0x20(%rbp)
00000000005055e0	movsd	0x140(%rdi), %xmm0
00000000005055e8	leaq	-0x30(%rbp), %rcx
00000000005055ec	movq	%rsi, %rdi
00000000005055ef	movq	%rdx, %rsi
00000000005055f2	movq	%rbx, %rdx
00000000005055f5	callq	__ZN18OZSceneArrangement27computeElementToPlaneOffsetERKNS_7ElementERK9PCVector4IdEdRK13OZRenderStateP9PCVector3IdE ## OZSceneArrangement::computeElementToPlaneOffset(OZSceneArrangement::Element const&, PCVector4<double> const&, double, OZRenderState const&, PCVector3<double>*)
00000000005055fa	testb	%al, %al
00000000005055fc	je	0x505621
00000000005055fe	movq	(%r14), %rdi
0000000000505601	movsd	-0x30(%rbp), %xmm0
0000000000505606	movsd	-0x28(%rbp), %xmm1
000000000050560b	movsd	-0x20(%rbp), %xmm2
0000000000505610	movq	%rbx, %rsi
0000000000505613	movl	$0x1, %edx
0000000000505618	movl	%eax, %ebx
000000000050561a	callq	__ZN15OZTransformNode17offsetTranslationEdddRK6CMTimeb ## OZTransformNode::offsetTranslation(double, double, double, CMTime const&, bool)
000000000050561f	movl	%ebx, %eax
0000000000505621	addq	$0x20, %rsp
0000000000505625	popq	%rbx
0000000000505626	popq	%r14
0000000000505628	popq	%rbp
0000000000505629	retq
000000000050562a	nopw	(%rax,%rax)
