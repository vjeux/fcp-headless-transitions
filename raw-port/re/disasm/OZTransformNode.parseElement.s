__ZN15OZTransformNode12parseElementER22PCSerializerReadStreamR15PCStreamElement:
00000000001ce930	pushq	%rbp
00000000001ce931	movq	%rsp, %rbp
00000000001ce934	pushq	%r14
00000000001ce936	pushq	%rbx
00000000001ce937	subq	$0x10, %rsp
00000000001ce93b	movq	%rdx, %r14
00000000001ce93e	movq	%rdi, %rbx
00000000001ce941	callq	__ZN11OZSceneNode12parseElementER22PCSerializerReadStreamR15PCStreamElement ## OZSceneNode::parseElement(PCSerializerReadStream&, PCStreamElement&)
00000000001ce946	movl	0x8(%r14), %eax
00000000001ce94a	cmpl	$0x12d, %eax                    ## imm = 0x12D
00000000001ce94f	je	0x1ce988
00000000001ce951	cmpl	$0x12c, %eax                    ## imm = 0x12C
00000000001ce956	jne	0x1ce9f8
00000000001ce95c	movq	(%r14), %rax
00000000001ce95f	leaq	-0x20(%rbp), %rsi
00000000001ce963	movq	%r14, %rdi
00000000001ce966	callq	*0x40(%rax)
00000000001ce969	testb	%al, %al
00000000001ce96b	je	0x1ce9a4
00000000001ce96d	movsd	-0x20(%rbp), %xmm0
00000000001ce972	movsd	%xmm0, 0x18d0(%rbx)
00000000001ce97a	xorpd	%xmm1, %xmm1
00000000001ce97e	ucomisd	%xmm1, %xmm0
00000000001ce982	jne	0x1ce9f8
00000000001ce984	jnp	0x1ce9b8
00000000001ce986	jmp	0x1ce9f8
00000000001ce988	movq	(%r14), %rax
00000000001ce98b	leaq	-0x14(%rbp), %rsi
00000000001ce98f	movq	%r14, %rdi
00000000001ce992	callq	*0x20(%rax)
00000000001ce995	testb	%al, %al
00000000001ce997	je	0x1ce9f8
00000000001ce999	movl	-0x14(%rbp), %eax
00000000001ce99c	movl	%eax, 0x18d8(%rbx)
00000000001ce9a2	jmp	0x1ce9f8
00000000001ce9a4	movsd	0x18d0(%rbx), %xmm0
00000000001ce9ac	xorpd	%xmm1, %xmm1
00000000001ce9b0	ucomisd	%xmm1, %xmm0
00000000001ce9b4	jne	0x1ce9f8
00000000001ce9b6	jp	0x1ce9f8
00000000001ce9b8	movq	(%rbx), %rax
00000000001ce9bb	movq	%rbx, %rdi
00000000001ce9be	callq	*0x110(%rax)
00000000001ce9c4	testq	%rax, %rax
00000000001ce9c7	je	0x1ce9e7
00000000001ce9c9	movq	(%rbx), %rax
00000000001ce9cc	movq	%rbx, %rdi
00000000001ce9cf	callq	*0x110(%rax)
00000000001ce9d5	movsd	0xc0(%rax), %xmm0
00000000001ce9dd	movsd	%xmm0, 0x18d0(%rbx)
00000000001ce9e5	jmp	0x1ce9f8
00000000001ce9e7	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
00000000001ce9f1	movq	%rax, 0x18d0(%rbx)
00000000001ce9f8	movb	$0x1, %al
00000000001ce9fa	addq	$0x10, %rsp
00000000001ce9fe	popq	%rbx
00000000001ce9ff	popq	%r14
00000000001cea01	popq	%rbp
00000000001cea02	retq
00000000001cea03	nopw	%cs:(%rax,%rax)
