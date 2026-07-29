
/tmp/ProChannel.x86_64:	file format mach-o 64-bit x86-64

Disassembly of section __TEXT,__text:

0000000000070504 <__ZN18OZChannelHistogram11getWhiteOutEi>:
   70504: 55                           	pushq	%rbp
   70505: 48 89 e5                     	movq	%rsp, %rbp
   70508: 83 fe 04                     	cmpl	$0x4, %esi
   7050b: 77 3d                        	ja	0x7054a <__ZN18OZChannelHistogram11getWhiteOutEi+0x46>
   7050d: 48 89 f8                     	movq	%rdi, %rax
   70510: 89 f1                        	movl	%esi, %ecx
   70512: 48 8d 15 37 00 00 00         	leaq	0x37(%rip), %rdx        ## 0x70550 <__ZN18OZChannelHistogram11getWhiteOutEi+0x4c>
   70519: 48 63 0c 8a                  	movslq	(%rdx,%rcx,4), %rcx
   7051d: 48 01 d1                     	addq	%rdx, %rcx
   70520: ff e1                        	jmpq	*%rcx
   70522: 48 05 d8 03 00 00            	addq	$0x3d8, %rax            ## imm = 0x3D8
   70528: eb 22                        	jmp	0x7054c <__ZN18OZChannelHistogram11getWhiteOutEi+0x48>
   7052a: 48 05 d8 11 00 00            	addq	$0x11d8, %rax           ## imm = 0x11D8
   70530: eb 1a                        	jmp	0x7054c <__ZN18OZChannelHistogram11getWhiteOutEi+0x48>
   70532: 48 05 d8 0a 00 00            	addq	$0xad8, %rax            ## imm = 0xAD8
   70538: eb 12                        	jmp	0x7054c <__ZN18OZChannelHistogram11getWhiteOutEi+0x48>
   7053a: 48 05 58 0e 00 00            	addq	$0xe58, %rax            ## imm = 0xE58
   70540: eb 0a                        	jmp	0x7054c <__ZN18OZChannelHistogram11getWhiteOutEi+0x48>
   70542: 48 05 58 07 00 00            	addq	$0x758, %rax            ## imm = 0x758
   70548: eb 02                        	jmp	0x7054c <__ZN18OZChannelHistogram11getWhiteOutEi+0x48>
   7054a: 31 c0                        	xorl	%eax, %eax
   7054c: 5d                           	popq	%rbp
   7054d: c3                           	retq
   7054e: 66 90                        	nop
   70550: d2 ff                        	sarb	%cl, %bh
   70552: ff ff                        	<unknown>
   70554: f2 ff ff                     	<unknown>
   70557: ff e2                        	jmpq	*%rdx
   70559: ff ff                        	<unknown>
   7055b: ff ea                        	<unknown>
   7055d: ff ff                        	<unknown>
   7055f: ff da                        	<unknown>
   70561: ff ff                        	<unknown>
   70563: ff 55 48                     	callq	*0x48(%rbp)
