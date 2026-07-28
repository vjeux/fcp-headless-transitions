__ZN10OZHeCanvas7SetRectERK6PCRectIiE:
00000000005a71c0	pushq	%rbp
00000000005a71c1	movq	%rsp, %rbp
00000000005a71c4	pushq	%rbx
00000000005a71c5	pushq	%rax
00000000005a71c6	movq	%rdi, %rbx
00000000005a71c9	movl	(%rsi), %edi
00000000005a71cb	movl	0x4(%rsi), %eax
00000000005a71ce	movl	0x8(%rsi), %edx
00000000005a71d1	addl	%edi, %edx
00000000005a71d3	movl	0xc(%rsi), %ecx
00000000005a71d6	addl	%eax, %ecx
00000000005a71d8	movl	%eax, %esi
00000000005a71da	callq	0x6dcca8                        ## symbol stub for: _HGRectMake4i
00000000005a71df	movq	%rax, 0x1a0(%rbx)
00000000005a71e6	movq	%rdx, 0x1a8(%rbx)
00000000005a71ed	movl	$0x1, %eax
00000000005a71f2	addq	$0x8, %rsp
00000000005a71f6	popq	%rbx
00000000005a71f7	popq	%rbp
00000000005a71f8	retq
00000000005a71f9	nopl	(%rax)
