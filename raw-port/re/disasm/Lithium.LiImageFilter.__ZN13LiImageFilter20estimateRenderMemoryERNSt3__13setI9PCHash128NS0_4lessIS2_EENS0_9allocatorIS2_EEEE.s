__ZN13LiImageFilter20estimateRenderMemoryERNSt3__13setI9PCHash128NS0_4lessIS2_EENS0_9allocatorIS2_EEEE:
000000000007df08	pushq	%rbp
000000000007df09	movq	%rsp, %rbp
000000000007df0c	movq	0x10(%rdi), %rdi
000000000007df10	testq	%rdi, %rdi
000000000007df13	je	0x7df1f
000000000007df15	movq	(%rdi), %rax
000000000007df18	movq	0x70(%rax), %rax
000000000007df1c	popq	%rbp
000000000007df1d	jmpq	*%rax
000000000007df1f	xorl	%eax, %eax
000000000007df21	popq	%rbp
000000000007df22	retq
000000000007df23	nop
