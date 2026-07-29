__ZN13HGConvolution17SeparableFilter2DE14HGFilterPresetS0_:
0000000000167630	pushq	%rbp
0000000000167631	movq	%rsp, %rbp
0000000000167634	pushq	%r14
0000000000167636	pushq	%rbx
0000000000167637	movl	%edx, %ebx
0000000000167639	movq	%rdi, %r14
000000000016763c	addq	$0x198, %rdi                    ## imm = 0x198
0000000000167643	movl	$0x4, %edx
0000000000167648	callq	__ZN16HGLinearFilter2D7setTypeE14HGFilterPresetj ## HGLinearFilter2D::setType(HGFilterPreset, unsigned int)
000000000016764d	leaq	0x1b8(%r14), %rdi
0000000000167654	movl	%ebx, %esi
0000000000167656	movl	$0x4, %edx
000000000016765b	callq	__ZN16HGLinearFilter2D7setTypeE14HGFilterPresetj ## HGLinearFilter2D::setType(HGFilterPreset, unsigned int)
0000000000167660	movl	$0xffffffff, 0x1d8(%r14)        ## imm = 0xFFFFFFFF
000000000016766b	movl	$0x2, 0x200(%r14)
0000000000167676	popq	%rbx
0000000000167677	popq	%r14
0000000000167679	popq	%rbp
000000000016767a	retq
000000000016767b	nopl	(%rax,%rax)
