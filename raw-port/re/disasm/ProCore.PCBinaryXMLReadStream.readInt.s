__ZN21PCBinaryXMLReadStream7readIntER8PCStreamiPi:
00000000000654da	pushq	%rbp
00000000000654db	movq	%rsp, %rbp
00000000000654de	pushq	%rbx
00000000000654df	pushq	%rax
00000000000654e0	movq	%rcx, %rbx
00000000000654e3	leaq	-0x10(%rbp), %rcx
00000000000654e7	callq	__ZN21PCBinaryXMLReadStream7readIntER8PCStreamiPx ## PCBinaryXMLReadStream::readInt(PCStream&, int, long long*)
00000000000654ec	testb	%al, %al
00000000000654ee	je	0x654f5
00000000000654f0	movl	-0x10(%rbp), %ecx
00000000000654f3	movl	%ecx, (%rbx)
00000000000654f5	addq	$0x8, %rsp
00000000000654f9	popq	%rbx
00000000000654fa	popq	%rbp
00000000000654fb	retq
