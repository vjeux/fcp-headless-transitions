__ZN27MaskBaseSubSegmentationInfoC1E35FFEffectMissingSynthesizedDataState11CMTimeRangeP8NSString:
00000000006096b0	pushq	%rbp
00000000006096b1	movq	%rsp, %rbp
00000000006096b4	pushq	%r14
00000000006096b6	pushq	%rbx
00000000006096b7	movq	%rdi, %rbx
00000000006096ba	movb	$0x1, (%rdi)
00000000006096bd	movq	%rsi, 0x8(%rdi)
00000000006096c1	movaps	0x10(%rbp), %xmm0
00000000006096c5	movaps	0x20(%rbp), %xmm1
00000000006096c9	movaps	0x30(%rbp), %xmm2
00000000006096cd	movups	%xmm0, 0x10(%rdi)
00000000006096d1	movups	%xmm1, 0x20(%rdi)
00000000006096d5	movups	%xmm2, 0x30(%rdi)
00000000006096d9	movq	%rdx, 0x40(%rdi)
00000000006096dd	addq	$0x40, %rbx
00000000006096e1	movq	%rbx, %rdi
00000000006096e4	callq	0x1496f90                       ## symbol stub for: __ZNK12ProCore_Impl11PCNSRefImpl6retainEv
00000000006096e9	popq	%rbx
00000000006096ea	popq	%r14
00000000006096ec	popq	%rbp
00000000006096ed	retq
00000000006096ee	movq	%rax, %r14
00000000006096f1	movq	%rbx, %rdi
00000000006096f4	callq	0x1496f96                       ## symbol stub for: __ZNK12ProCore_Impl11PCNSRefImpl7releaseEv
00000000006096f9	movq	%r14, %rdi
00000000006096fc	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000609701	movq	%rax, %rdi
0000000000609704	callq	___clang_call_terminate
0000000000609709	nopl	(%rax)
