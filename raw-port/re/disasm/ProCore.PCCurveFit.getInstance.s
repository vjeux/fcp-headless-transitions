__ZN10PCCurveFit11getInstanceEv:
000000000000b434	cmpq	$-0x1, __ZZN10PCCurveFit11getInstanceEvE4once(%rip) ## PCCurveFit::getInstance()::once
000000000000b43c	jne	0xb446
000000000000b43e	movq	__ZN10PCCurveFit9_instanceE(%rip), %rax ## PCCurveFit::_instance
000000000000b445	retq
000000000000b446	pushq	%rbp
000000000000b447	movq	%rsp, %rbp
000000000000b44a	callq	__ZN10PCCurveFit11getInstanceEv.cold.1 ## PCCurveFit::getInstance() (.cold.1)
000000000000b44f	popq	%rbp
000000000000b450	jmp	0xb43e
