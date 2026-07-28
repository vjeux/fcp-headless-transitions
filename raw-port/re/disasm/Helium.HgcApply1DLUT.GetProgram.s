__ZN13HgcApply1DLUT10GetProgramEP10HGRenderer:
0000000000025030	pushq	%rbp
0000000000025031	movq	%rsp, %rbp
0000000000025034	xorps	%xmm0, %xmm0
0000000000025037	xorl	%eax, %eax
0000000000025039	ucomiss	0x1cc(%rdi), %xmm0
0000000000025040	seta	%al
0000000000025043	movzbl	0x1e0(%rdi), %edx
000000000002504a	movq	%rsi, %rdi
000000000002504d	movl	%eax, %esi
000000000002504f	popq	%rbp
0000000000025050	jmp	__Z17GetApply1DProgramP10HGRendererbb ## GetApply1DProgram(HGRenderer*, bool, bool)
0000000000025055	nopw	%cs:(%rax,%rax)
