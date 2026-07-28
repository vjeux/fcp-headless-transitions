__ZN20OZImageNodeRender36017fixPixelTransformER7LiAgentP14PCMatrix44TmplIdERK18LiRenderParameters:
000000000041dcd0	pushq	%rbp
000000000041dcd1	movq	%rsp, %rbp
000000000041dcd4	pushq	%r15
000000000041dcd6	pushq	%r14
000000000041dcd8	pushq	%rbx
000000000041dcd9	subq	$0x18, %rsp
000000000041dcdd	movq	%rdx, %rbx
000000000041dce0	movq	%rdi, %r15
000000000041dce3	movq	(%rdi), %rax
000000000041dce6	movq	%rcx, %rsi
000000000041dce9	callq	*0x38(%rax)
000000000041dcec	cmpl	$0x6, %eax
000000000041dcef	je	0x41de0f
000000000041dcf5	movl	%eax, %r14d
000000000041dcf8	addq	$0x18, %r15
000000000041dcfc	leaq	-0x28(%rbp), %rdi
000000000041dd00	movq	%r15, %rsi
000000000041dd03	callq	__ZNK14OZRenderParams13getResolutionEv ## OZRenderParams::getResolution() const
000000000041dd08	movsd	-0x28(%rbp), %xmm1
000000000041dd0d	movsd	-0x20(%rbp), %xmm0
000000000041dd12	xorpd	%xmm4, %xmm4
000000000041dd16	movsd	0x60(%rbx), %xmm2
000000000041dd1b	mulsd	%xmm4, %xmm2
000000000041dd1f	movsd	0x68(%rbx), %xmm5
000000000041dd24	mulsd	%xmm4, %xmm5
000000000041dd28	addsd	%xmm2, %xmm5
000000000041dd2c	addsd	0x78(%rbx), %xmm5
000000000041dd31	movsd	(%rbx), %xmm2
000000000041dd35	mulsd	%xmm4, %xmm2
000000000041dd39	movsd	0x8(%rbx), %xmm3
000000000041dd3e	mulsd	%xmm4, %xmm3
000000000041dd42	addsd	%xmm2, %xmm3
000000000041dd46	addsd	0x18(%rbx), %xmm3
000000000041dd4b	movsd	0x20(%rbx), %xmm6
000000000041dd50	mulsd	%xmm4, %xmm6
000000000041dd54	movsd	0x28(%rbx), %xmm2
000000000041dd59	mulsd	%xmm4, %xmm2
000000000041dd5d	addsd	%xmm6, %xmm2
000000000041dd61	addsd	0x38(%rbx), %xmm2
000000000041dd66	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
000000000041dd70	movq	%rax, 0x78(%rbx)
000000000041dd74	movq	%rax, 0x50(%rbx)
000000000041dd78	xorpd	%xmm6, %xmm6
000000000041dd7c	movupd	%xmm6, 0x8(%rbx)
000000000041dd81	movupd	%xmm6, 0x18(%rbx)
000000000041dd86	movupd	%xmm6, 0x40(%rbx)
000000000041dd8b	movupd	%xmm6, 0x30(%rbx)
000000000041dd90	movupd	%xmm6, 0x58(%rbx)
000000000041dd95	movupd	%xmm6, 0x68(%rbx)
000000000041dd9a	movsd	%xmm1, (%rbx)
000000000041dd9e	movsd	%xmm0, 0x28(%rbx)
000000000041dda3	addl	$-0x3, %r14d
000000000041dda7	cmpl	$0x2, %r14d
000000000041ddab	ja	0x41de0f
000000000041ddad	divsd	%xmm5, %xmm3
000000000041ddb1	divsd	%xmm5, %xmm2
000000000041ddb5	ucomisd	%xmm4, %xmm3
000000000041ddb9	jne	0x41ddbd
000000000041ddbb	jnp	0x41dde0
000000000041ddbd	movapd	%xmm3, %xmm5
000000000041ddc1	mulsd	%xmm4, %xmm5
000000000041ddc5	addsd	%xmm5, %xmm1
000000000041ddc9	movsd	%xmm1, (%rbx)
000000000041ddcd	addsd	%xmm4, %xmm5
000000000041ddd1	movsd	%xmm5, 0x8(%rbx)
000000000041ddd6	movsd	%xmm5, 0x10(%rbx)
000000000041dddb	movsd	%xmm3, 0x18(%rbx)
000000000041dde0	xorpd	%xmm1, %xmm1
000000000041dde4	ucomisd	%xmm1, %xmm2
000000000041dde8	jne	0x41ddec
000000000041ddea	jnp	0x41de0f
000000000041ddec	mulsd	%xmm2, %xmm1
000000000041ddf0	xorpd	%xmm3, %xmm3
000000000041ddf4	unpcklpd	%xmm0, %xmm3                    ## xmm3 = xmm3[0],xmm0[0]
000000000041ddf8	movddup	%xmm1, %xmm0                    ## xmm0 = xmm1[0,0]
000000000041ddfc	addpd	%xmm3, %xmm0
000000000041de00	movupd	%xmm0, 0x20(%rbx)
000000000041de05	movlpd	%xmm0, 0x30(%rbx)
000000000041de0a	movsd	%xmm2, 0x38(%rbx)
000000000041de0f	addq	$0x18, %rsp
000000000041de13	popq	%rbx
000000000041de14	popq	%r14
000000000041de16	popq	%r15
000000000041de18	popq	%rbp
000000000041de19	retq
000000000041de1a	nopw	(%rax,%rax)
