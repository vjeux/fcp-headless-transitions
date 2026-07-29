__ZN12HGDenoisePDE12SetParameterEiffff:
00000000001c3210	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
00000000001c3215	testl	%esi, %esi
00000000001c3217	je	0x1c321a
00000000001c3219	retq
00000000001c321a	movss	0x1c8(%rdi), %xmm1
00000000001c3222	ucomiss	%xmm0, %xmm1
00000000001c3225	jne	0x1c3229
00000000001c3227	jnp	0x1c3241
00000000001c3229	pushq	%rbp
00000000001c322a	movq	%rsp, %rbp
00000000001c322d	movss	%xmm0, 0x1c8(%rdi)
00000000001c3235	callq	__ZN6HGNode9ClearBitsEv         ## HGNode::ClearBits()
00000000001c323a	movl	$0x1, %eax
00000000001c323f	popq	%rbp
00000000001c3240	retq
00000000001c3241	xorl	%eax, %eax
00000000001c3243	retq
00000000001c3244	nopw	%cs:(%rax,%rax)
