__ZN23FFNRRendererInfoManager14returnRendererEv:
00000000006c60c0	pushq	%rbp
00000000006c60c1	movq	%rsp, %rbp
00000000006c60c4	pushq	%r15
00000000006c60c6	pushq	%r14
00000000006c60c8	pushq	%rbx
00000000006c60c9	pushq	%rax
00000000006c60ca	movq	%rdi, %rbx
00000000006c60cd	leaq	_OBJC_CLASS_$_FFHGRendererManager(%rip), %rdi
00000000006c60d4	movq	0x14f2fad(%rip), %r14
00000000006c60db	movq	0x12275de(%rip), %r15           ## Objc message: -[%rdi sharpnessAmount]
00000000006c60e2	movq	%r14, %rsi
00000000006c60e5	callq	*%r15
00000000006c60e8	movq	0x1511021(%rip), %rsi
00000000006c60ef	movq	%rax, %rdi
00000000006c60f2	xorl	%edx, %edx
00000000006c60f4	xorl	%ecx, %ecx
00000000006c60f6	callq	*%r15
00000000006c60f9	cmpq	$0x0, (%rbx)
00000000006c60fd	je	0x6c6123
00000000006c60ff	leaq	_OBJC_CLASS_$_FFHGRendererManager(%rip), %rdi
00000000006c6106	movq	%r14, %rsi
00000000006c6109	callq	*%r15
00000000006c610c	movq	(%rbx), %rdx
00000000006c610f	movq	0x1511002(%rip), %rsi
00000000006c6116	movq	%rax, %rdi
00000000006c6119	callq	*%r15
00000000006c611c	movq	$0x0, (%rbx)
00000000006c6123	movq	0x8(%rbx), %rdi
00000000006c6127	callq	*0x12275db(%rip)                ## literal pool symbol address: _objc_release
00000000006c612d	movq	$0x0, 0x8(%rbx)
00000000006c6135	addq	$0x8, %rsp
00000000006c6139	popq	%rbx
00000000006c613a	popq	%r14
00000000006c613c	popq	%r15
00000000006c613e	popq	%rbp
00000000006c613f	retq
