__ZN14HGMetalHandler8FrameEndEv:
000000000015e340	movq	$0x0, 0x6fc(%rdi)
000000000015e34b	movl	$0x0, 0x704(%rdi)
000000000015e355	movq	0x90(%rdi), %rax
000000000015e35c	testq	%rax, %rax
000000000015e35f	je	0x15e3cb
000000000015e361	pushq	%rbp
000000000015e362	movq	%rsp, %rbp
000000000015e365	pushq	%rbx
000000000015e366	pushq	%rax
000000000015e367	movq	%rdi, %rbx
000000000015e36a	movl	0x3f8(%rax), %esi
000000000015e370	movl	$0x2b794948, %edi               ## imm = 0x2B794948
000000000015e375	xorl	%edx, %edx
000000000015e377	xorl	%ecx, %ecx
000000000015e379	xorl	%r8d, %r8d
000000000015e37c	callq	0x3c53d2                        ## symbol stub for: _kdebug_trace
000000000015e381	movq	0x90(%rbx), %rax
000000000015e388	movl	0x3f8(%rax), %esi
000000000015e38e	movl	0x700(%rbx), %edx
000000000015e394	movl	$0x2b79494c, %edi               ## imm = 0x2B79494C
000000000015e399	xorl	%ecx, %ecx
000000000015e39b	xorl	%r8d, %r8d
000000000015e39e	callq	0x3c53d2                        ## symbol stub for: _kdebug_trace
000000000015e3a3	movq	0x90(%rbx), %rax
000000000015e3aa	movl	0x3f8(%rax), %esi
000000000015e3b0	movl	0x704(%rbx), %edx
000000000015e3b6	movl	$0x2b794950, %edi               ## imm = 0x2B794950
000000000015e3bb	xorl	%ecx, %ecx
000000000015e3bd	xorl	%r8d, %r8d
000000000015e3c0	addq	$0x8, %rsp
000000000015e3c4	popq	%rbx
000000000015e3c5	popq	%rbp
000000000015e3c6	jmp	0x3c53d2                        ## symbol stub for: _kdebug_trace
000000000015e3cb	retq
000000000015e3cc	nopl	(%rax)
