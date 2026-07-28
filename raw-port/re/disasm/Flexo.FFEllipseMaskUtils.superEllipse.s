0000000000613dc2	movl	%esp, %ebp
0000000000613dc4	pushq	%r14
0000000000613dc6	pushq	%rbx
0000000000613dc7	subq	$0x20, %rsp
0000000000613dcb	movq	%rsi, %rbx
0000000000613dce	movq	%rdi, %r14
0000000000613dd1	movss	%xmm2, -0x20(%rbp)
0000000000613dd6	movss	%xmm1, -0x18(%rbp)
0000000000613ddb	movss	%xmm0, -0x1c(%rbp)
0000000000613de0	movss	0xf5ab58(%rip), %xmm1
0000000000613de8	divss	%xmm3, %xmm1
0000000000613dec	movss	%xmm1, -0x14(%rbp)
0000000000613df1	callq	0x14974ee                       ## symbol stub for: ___sincosf_stret
0000000000613df6	movaps	%xmm0, -0x30(%rbp)
0000000000613dfa	movshdup	%xmm0, %xmm0                    ## xmm0 = xmm0[1,1,3,3]
0000000000613dfe	andps	0xf58fab(%rip), %xmm0
0000000000613e05	movss	-0x14(%rbp), %xmm1
0000000000613e0a	callq	0x1497a46                       ## symbol stub for: _powf
0000000000613e0f	mulss	-0x18(%rbp), %xmm0
0000000000613e14	movss	%xmm0, (%r14)
0000000000613e19	movaps	-0x30(%rbp), %xmm0
0000000000613e1d	andps	0xf58f8c(%rip), %xmm0
0000000000613e24	movss	-0x14(%rbp), %xmm1
0000000000613e29	callq	0x1497a46                       ## symbol stub for: _powf
0000000000613e2e	mulss	-0x20(%rbp), %xmm0
0000000000613e33	movss	-0x1c(%rbp), %xmm1
0000000000613e38	cvtss2sd	%xmm1, %xmm1
0000000000613e3c	movss	%xmm0, (%rbx)
0000000000613e40	ucomisd	0xf5beb8(%rip), %xmm1
0000000000613e48	ja	0x613e71
0000000000613e4a	ucomisd	0xf5be9e(%rip), %xmm1
0000000000613e52	jbe	0x613e5f
0000000000613e54	xorb	$-0x80, 0x3(%r14)
0000000000613e59	movss	(%rbx), %xmm0
0000000000613e5d	jmp	0x613e71
0000000000613e5f	ucomisd	0xf5bea1(%rip), %xmm1
0000000000613e67	jbe	0x613e7c
0000000000613e69	movss	(%r14), %xmm0
0000000000613e6e	movq	%r14, %rbx
0000000000613e71	xorps	0xf58e78(%rip), %xmm0
0000000000613e78	movss	%xmm0, (%rbx)
0000000000613e7c	addq	$0x20, %rsp
0000000000613e80	popq	%rbx
0000000000613e81	popq	%r14
0000000000613e83	popq	%rbp
0000000000613e84	retq
0000000000613e85	nopw	%cs:(%rax,%rax)
__ZN18FFEllipseMaskUtils36resetSuperEllipseShapeFolderCallbackEP13OZChannelBasePv:
