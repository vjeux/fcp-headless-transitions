__ZNK8OZSpline14getSmallDeltaUEv:
000000000002fe52	pushq	%rbp
000000000002fe53	movq	%rsp, %rbp
000000000002fe56	pushq	%rbx
000000000002fe57	pushq	%rax
000000000002fe58	movq	%rdi, %rbx
000000000002fe5b	movq	0xa8(%rsi), %rax
000000000002fe62	cmpb	$0x0, (%rax)
000000000002fe65	movl	$0x1, %eax
000000000002fe6a	movl	$0x64, %edx
000000000002fe6f	cmovnel	%eax, %edx
000000000002fe72	movl	$0x1, %esi
000000000002fe77	callq	0xaca92                         ## symbol stub for: _CMTimeMake
000000000002fe7c	movq	%rbx, %rax
000000000002fe7f	addq	$0x8, %rsp
000000000002fe83	popq	%rbx
000000000002fe84	popq	%rbp
000000000002fe85	retq
