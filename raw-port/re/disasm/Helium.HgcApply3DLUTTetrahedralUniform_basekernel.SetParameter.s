__ZN42HgcApply3DLUTTetrahedralUniform_basekernel12SetParameterEiffff:
000000000039add0	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
000000000039add5	cmpl	$0x2, %esi
000000000039add8	ja	0x39ae43
000000000039adda	movq	0x198(%rdi), %rcx
000000000039ade1	movl	%esi, %edx
000000000039ade3	shlq	$0x5, %rdx
000000000039ade7	leaq	(%rcx,%rdx), %rax
000000000039adeb	movss	(%rcx,%rdx), %xmm4
000000000039adf0	ucomiss	%xmm0, %xmm4
000000000039adf3	jne	0x39ae1b
000000000039adf5	jp	0x39ae1b
000000000039adf7	movss	0x4(%rax), %xmm4
000000000039adfc	ucomiss	%xmm1, %xmm4
000000000039adff	jne	0x39ae1b
000000000039ae01	jp	0x39ae1b
000000000039ae03	movss	0x8(%rax), %xmm4
000000000039ae08	ucomiss	%xmm2, %xmm4
000000000039ae0b	jne	0x39ae1b
000000000039ae0d	jp	0x39ae1b
000000000039ae0f	movss	0xc(%rax), %xmm4
000000000039ae14	ucomiss	%xmm3, %xmm4
000000000039ae17	jne	0x39ae1b
000000000039ae19	jnp	0x39ae44
000000000039ae1b	pushq	%rbp
000000000039ae1c	movq	%rsp, %rbp
000000000039ae1f	insertps	$0x10, %xmm1, %xmm0             ## xmm0 = xmm0[0],xmm1[0],xmm0[2,3]
000000000039ae25	insertps	$0x20, %xmm2, %xmm0             ## xmm0 = xmm0[0,1],xmm2[0],xmm0[3]
000000000039ae2b	insertps	$0x30, %xmm3, %xmm0             ## xmm0 = xmm0[0,1,2],xmm3[0]
000000000039ae31	movups	%xmm0, 0x10(%rax)
000000000039ae35	movups	%xmm0, (%rax)
000000000039ae38	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
000000000039ae3d	movl	$0x1, %eax
000000000039ae42	popq	%rbp
000000000039ae43	retq
000000000039ae44	xorl	%eax, %eax
000000000039ae46	retq
000000000039ae47	nopw	(%rax,%rax)
