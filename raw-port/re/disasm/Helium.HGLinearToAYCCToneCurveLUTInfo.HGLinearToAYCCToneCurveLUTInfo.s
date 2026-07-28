__ZN30HGLinearToAYCCToneCurveLUTInfoC2EmffN16HGApplyNDLUTInfo16LUTStorageFormatE:
00000000001151e0	pushq	%rbp
00000000001151e1	movq	%rsp, %rbp
00000000001151e4	pushq	%rbx
00000000001151e5	pushq	%rax
00000000001151e6	movl	%edx, %ecx
00000000001151e8	movq	%rdi, %rbx
00000000001151eb	movl	$0x1, %edx
00000000001151f0	callq	__ZN16HGApplyNDLUTInfoC2EmmffNS_16LUTStorageFormatE ## HGApplyNDLUTInfo::HGApplyNDLUTInfo(unsigned long, unsigned long, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
00000000001151f5	leaq	0x907eac(%rip), %rax
00000000001151fc	movq	%rax, (%rbx)
00000000001151ff	addq	$0x8, %rsp
0000000000115203	popq	%rbx
0000000000115204	popq	%rbp
0000000000115205	retq
0000000000115206	nopw	%cs:(%rax,%rax)
__ZNK30HGLinearToAYCCToneCurveLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE:
0000000000115210	pushq	%rbp
0000000000115211	movq	%rsp, %rbp
0000000000115214	pushq	%rbx
0000000000115215	pushq	%rax
0000000000115216	testq	%rsi, %rsi
