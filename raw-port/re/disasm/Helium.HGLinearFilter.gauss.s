__ZN14HGLinearFilter5gaussEfff:
000000000010f160	pushq	%rbp
000000000010f161	movq	%rsp, %rbp
000000000010f164	mulss	0x2bb180(%rip), %xmm0
000000000010f16c	movss	0x2b8b58(%rip), %xmm1
000000000010f174	mulss	%xmm0, %xmm1
000000000010f178	mulss	%xmm1, %xmm0
000000000010f17c	popq	%rbp
000000000010f17d	jmp	0x3c50fc                        ## symbol stub for: _expf
000000000010f182	nopw	%cs:(%rax,%rax)
