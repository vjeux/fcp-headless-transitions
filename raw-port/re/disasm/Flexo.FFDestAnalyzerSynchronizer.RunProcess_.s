__ZN26FFDestAnalyzerSynchronizer11RunProcess_EPv:
0000000001320a80	pushq	%rbp
0000000001320a81	movq	%rsp, %rbp
0000000001320a84	pushq	%rbx
0000000001320a85	pushq	%rax
0000000001320a86	movq	%rdi, %rbx
0000000001320a89	movq	%rdi, -0x10(%rbp)
0000000001320a8d	leaq	0x36db80(%rip), %rdi            ## literal pool for: "com.apple.flexo.ffdest.tracking"
0000000001320a94	callq	0x1497b1e                       ## symbol stub for: _pthread_setname_np
0000000001320a99	movl	$0x11, %edi
0000000001320a9e	xorl	%esi, %esi
0000000001320aa0	callq	0x1497b18                       ## symbol stub for: _pthread_set_qos_class_self_np
0000000001320aa5	movq	0x140(%rbx), %rdi
0000000001320aac	movq	0x8e0915(%rip), %rsi
0000000001320ab3	callq	*0x5ccc07(%rip)                 ## Objc message: -[%rdi arranged]
0000000001320ab9	leaq	-0x10(%rbp), %rsi
0000000001320abd	movq	%rbx, %rdi
0000000001320ac0	callq	__ZNK26FFDestAnalyzerSynchronizer10lockStreamIZNS_11RunProcess_EPvEUlvE_EEvT_ ## void FFDestAnalyzerSynchronizer::lockStream<FFDestAnalyzerSynchronizer::RunProcess_(void*)::'lambda'()>(FFDestAnalyzerSynchronizer::RunProcess_(void*)::'lambda'()) const
0000000001320ac5	xorl	%eax, %eax
0000000001320ac7	addq	$0x8, %rsp
0000000001320acb	popq	%rbx
0000000001320acc	popq	%rbp
0000000001320acd	retq
0000000001320ace	nop
