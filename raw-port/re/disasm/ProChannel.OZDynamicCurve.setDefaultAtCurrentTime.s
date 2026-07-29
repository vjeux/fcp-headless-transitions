__ZN14OZDynamicCurve23setDefaultAtCurrentTimeEPvRK6CMTime:
00000000000297bc	pushq	%rbp
00000000000297bd	movq	%rsp, %rbp
00000000000297c0	pushq	%r15
00000000000297c2	pushq	%r14
00000000000297c4	pushq	%r12
00000000000297c6	pushq	%rbx
00000000000297c7	movq	%rdx, %rbx
00000000000297ca	movq	%rsi, %r14
00000000000297cd	movq	%rdi, %r15
00000000000297d0	addq	$0x8, %r15
00000000000297d4	movq	%r15, %rdi
00000000000297d7	callq	__ZN8OZSpline13isValidHandleEPv ## OZSpline::isValidHandle(void*)
00000000000297dc	movl	%eax, %r12d
00000000000297df	testb	%al, %al
00000000000297e1	je	0x297f1
00000000000297e3	movq	%r15, %rdi
00000000000297e6	movq	%r14, %rsi
00000000000297e9	movq	%rbx, %rdx
00000000000297ec	callq	__ZN15OZDynamicSpline28setDefaultValueAtCurrentTimeEPvRK6CMTime ## OZDynamicSpline::setDefaultValueAtCurrentTime(void*, CMTime const&)
00000000000297f1	movl	%r12d, %eax
00000000000297f4	popq	%rbx
00000000000297f5	popq	%r12
00000000000297f7	popq	%r14
00000000000297f9	popq	%r15
00000000000297fb	popq	%rbp
00000000000297fc	retq
00000000000297fd	nop
