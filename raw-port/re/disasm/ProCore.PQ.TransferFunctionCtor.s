__ZN12_GLOBAL__N_12PQ16TransferFunctionC1Ev:
0000000000004784	pushq	%rbp
0000000000004785	movq	%rsp, %rbp
0000000000004788	movaps	0xdd711(%rip), %xmm0
000000000000478f	movaps	0xdd71a(%rip), %xmm1
0000000000004796	callq	0xde768                         ## symbol stub for: __simd_pow_f4
000000000000479b	movaps	0xdd67e(%rip), %xmm1
00000000000047a2	mulps	%xmm0, %xmm1
00000000000047a5	movaps	%xmm1, __ZZN12_GLOBAL__N_12PQ19getTransferFunctionEvE6result(%rip) ## (anonymous namespace)::PQ::getTransferFunction()::result
00000000000047ac	mulps	0xdd70d(%rip), %xmm0
00000000000047b3	movaps	%xmm0, 0x156996(%rip)
00000000000047ba	movaps	0xdd70f(%rip), %xmm0
00000000000047c1	movaps	0xdd688(%rip), %xmm1
00000000000047c8	callq	0xde768                         ## symbol stub for: __simd_pow_f4
00000000000047cd	movaps	%xmm0, 0x15698c(%rip)
00000000000047d4	popq	%rbp
00000000000047d5	retq
