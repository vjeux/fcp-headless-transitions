__ZN12_GLOBAL__N_12PQ19getTransferFunctionEv.cold.1:
00000000000dd2ad	pushq	%rbp
00000000000dd2ae	movq	%rsp, %rbp
00000000000dd2b1	leaq	__ZGVZN12_GLOBAL__N_12PQ19getTransferFunctionEvE6result(%rip), %rdi ## guard variable for (anonymous namespace)::PQ::getTransferFunction()::result
00000000000dd2b8	callq	0xde708                         ## symbol stub for: ___cxa_guard_acquire
00000000000dd2bd	testl	%eax, %eax
00000000000dd2bf	je	0xdd2d3
00000000000dd2c1	callq	__ZN12_GLOBAL__N_12PQ16TransferFunctionC1Ev ## (anonymous namespace)::PQ::TransferFunction::TransferFunction()
00000000000dd2c6	leaq	__ZGVZN12_GLOBAL__N_12PQ19getTransferFunctionEvE6result(%rip), %rdi ## guard variable for (anonymous namespace)::PQ::getTransferFunction()::result
00000000000dd2cd	popq	%rbp
00000000000dd2ce	jmp	0xde70e                         ## symbol stub for: ___cxa_guard_release
00000000000dd2d3	popq	%rbp
00000000000dd2d4	retq
