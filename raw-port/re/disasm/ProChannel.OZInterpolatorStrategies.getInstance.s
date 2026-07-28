__ZN24OZInterpolatorStrategies11getInstanceEv:
0000000000044dfe	cmpq	$-0x1, __ZZN24OZInterpolatorStrategies11getInstanceEvE4once(%rip) ## OZInterpolatorStrategies::getInstance()::once
0000000000044e06	jne	0x44e10
0000000000044e08	movq	__ZN24OZInterpolatorStrategies9_instanceE(%rip), %rax ## OZInterpolatorStrategies::_instance
0000000000044e0f	retq
0000000000044e10	pushq	%rbp
0000000000044e11	movq	%rsp, %rbp
0000000000044e14	callq	__ZN24OZInterpolatorStrategies11getInstanceEv.cold.1 ## OZInterpolatorStrategies::getInstance() (.cold.1)
0000000000044e19	popq	%rbp
0000000000044e1a	jmp	0x44e08
