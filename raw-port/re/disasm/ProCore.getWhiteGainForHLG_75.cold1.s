__ZL21getWhiteGainForHLG_75v.cold.1:
00000000000dd2fd	pushq	%rbp
00000000000dd2fe	movq	%rsp, %rbp
00000000000dd301	leaq	__ZGVZL21getWhiteGainForHLG_75vE6result(%rip), %rdi ## guard variable for getWhiteGainForHLG_75()::result
00000000000dd308	callq	0xde708                         ## symbol stub for: ___cxa_guard_acquire
00000000000dd30d	testl	%eax, %eax
00000000000dd30f	je	0xdd333
00000000000dd311	movss	0x4cf3(%rip), %xmm0
00000000000dd319	callq	__ZL23getWhiteGainForHLGLevelf  ## getWhiteGainForHLGLevel(float)
00000000000dd31e	movss	%xmm0, __ZZL21getWhiteGainForHLG_75vE6result(%rip) ## getWhiteGainForHLG_75()::result
00000000000dd326	leaq	__ZGVZL21getWhiteGainForHLG_75vE6result(%rip), %rdi ## guard variable for getWhiteGainForHLG_75()::result
00000000000dd32d	popq	%rbp
00000000000dd32e	jmp	0xde70e                         ## symbol stub for: ___cxa_guard_release
00000000000dd333	popq	%rbp
00000000000dd334	retq
