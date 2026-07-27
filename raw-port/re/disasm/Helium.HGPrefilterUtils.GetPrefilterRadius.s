__ZN16HGPrefilterUtils18GetPrefilterRadiusENS_10KernelTypeEff:
0000000000109e10	xorl	%eax, %eax
0000000000109e12	cmpl	$0x3, %edi
0000000000109e15	ja	0x109e5b
0000000000109e17	pushq	%rbp
0000000000109e18	movq	%rsp, %rbp
0000000000109e1b	pushq	%rbx
0000000000109e1c	pushq	%rax
0000000000109e1d	movl	%edi, %ebx
0000000000109e1f	movss	%xmm1, -0xc(%rbp)
0000000000109e24	callq	0x3c53f6                        ## symbol stub for: _log10f
0000000000109e29	divss	0x2c84db(%rip), %xmm0
0000000000109e31	movl	%ebx, %eax
0000000000109e33	leaq	0x2c84e6(%rip), %rcx
0000000000109e3a	movss	-0xc(%rbp), %xmm1
0000000000109e3f	mulss	(%rcx,%rax,4), %xmm1
0000000000109e44	mulss	%xmm0, %xmm1
0000000000109e48	xorps	%xmm0, %xmm0
0000000000109e4b	roundss	$0xa, %xmm1, %xmm0
0000000000109e51	cvttss2si	%xmm0, %eax
0000000000109e55	addq	$0x8, %rsp
0000000000109e59	popq	%rbx
0000000000109e5a	popq	%rbp
0000000000109e5b	retq
0000000000109e5c	nopl	(%rax)
