__ZN39HgcAVASpatialAverageAdaptive_LowerField12SetParameterEiffff:
000000000021f2c0	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
000000000021f2c5	testl	%esi, %esi
000000000021f2c7	je	0x21f2ca
000000000021f2c9	retq
000000000021f2ca	movq	0x198(%rdi), %rax
000000000021f2d1	movss	(%rax), %xmm4
000000000021f2d5	ucomiss	%xmm0, %xmm4
000000000021f2d8	jne	0x21f300
000000000021f2da	jp	0x21f300
000000000021f2dc	movss	0x4(%rax), %xmm4
000000000021f2e1	ucomiss	%xmm1, %xmm4
000000000021f2e4	jne	0x21f300
000000000021f2e6	jp	0x21f300
000000000021f2e8	movss	0x8(%rax), %xmm4
000000000021f2ed	ucomiss	%xmm2, %xmm4
000000000021f2f0	jne	0x21f300
000000000021f2f2	jp	0x21f300
000000000021f2f4	movss	0xc(%rax), %xmm4
000000000021f2f9	ucomiss	%xmm3, %xmm4
000000000021f2fc	jne	0x21f300
000000000021f2fe	jnp	0x21f329
000000000021f300	pushq	%rbp
000000000021f301	movq	%rsp, %rbp
000000000021f304	insertps	$0x10, %xmm1, %xmm0             ## xmm0 = xmm0[0],xmm1[0],xmm0[2,3]
000000000021f30a	insertps	$0x20, %xmm2, %xmm0             ## xmm0 = xmm0[0,1],xmm2[0],xmm0[3]
000000000021f310	insertps	$0x30, %xmm3, %xmm0             ## xmm0 = xmm0[0,1,2],xmm3[0]
000000000021f316	movups	%xmm0, 0x10(%rax)
000000000021f31a	movups	%xmm0, (%rax)
000000000021f31d	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
000000000021f322	movl	$0x1, %eax
000000000021f327	popq	%rbp
000000000021f328	retq
000000000021f329	xorl	%eax, %eax
000000000021f32b	retq
000000000021f32c	nopl	(%rax)
