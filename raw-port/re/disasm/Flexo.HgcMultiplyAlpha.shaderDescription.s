__ZNK16HgcMultiplyAlpha17shaderDescriptionEv:
0000000001468c70	pushq	%rbp
0000000001468c71	movq	%rsp, %rbp
0000000001468c74	pushq	%rbx
0000000001468c75	pushq	%rax
0000000001468c76	movq	%rdi, %rbx
0000000001468c79	movl	$0x1a, %edi
0000000001468c7e	callq	0x1497452                       ## symbol stub for: __Znwm
0000000001468c83	movq	%rax, 0x10(%rbx)
0000000001468c87	movq	$0x1b, (%rbx)
0000000001468c8e	movq	$0x17, 0x8(%rbx)
0000000001468c96	movabsq	$0x5d316367685b2061, %rcx       ## imm = 0x5D316367685B2061
0000000001468ca0	movq	%rcx, 0xf(%rax)
0000000001468ca4	movups	0x2440af(%rip), %xmm0           ## literal pool for: "HgcMultiplyAlpha [hgc1]"
0000000001468cab	movups	%xmm0, (%rax)
0000000001468cae	movb	$0x0, 0x17(%rax)
0000000001468cb2	movq	%rbx, %rax
0000000001468cb5	addq	$0x8, %rsp
0000000001468cb9	popq	%rbx
0000000001468cba	popq	%rbp
0000000001468cbb	retq
0000000001468cbc	nopl	(%rax)
